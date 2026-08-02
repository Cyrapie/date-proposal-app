-- ============================================================================
-- Console d'administration indépendante (/console). Appliqué le 2026-08-02.
--
-- Trois apports :
--   1. `users.suspended_at` — un compte suspendu conserve ses données mais ne
--      peut plus créer d'invitation. Appliqué côté serveur, pas seulement
--      affiché.
--   2. `admin_audit_log` — trace de chaque action d'administration. Écrite
--      uniquement par `service_role`, jamais modifiable ni supprimable depuis
--      l'application.
--   3. Fonctions `console_*` d'inspection et d'action.
--
-- Comme pour `admin_*`, toutes ces fonctions sont réservées à `service_role`
-- et ne sont jamais la seule barrière : la console vérifie d'abord l'identité
-- de l'appelant (session dédiée + allowlist d'emails + `is_super_admin`).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Suspension de compte
-- ----------------------------------------------------------------------------
alter table public.users
  add column if not exists suspended_at timestamptz;

comment on column public.users.suspended_at is
  'Non nul = compte suspendu : les données restent, la création d''invitation est refusée côté serveur.';

-- ----------------------------------------------------------------------------
-- 2. Journal d'activité
-- ----------------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  -- L'acteur n'est pas une FK : la trace doit survivre à la suppression du
  -- compte qui l'a produite.
  actor_email text not null,
  action text not null,
  target_type text,
  target_id text,
  target_label text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

-- Aucune policy : personne n'y accède avec la clé anon. `service_role`
-- contourne RLS, ce qui suffit à la console.
comment on table public.admin_audit_log is
  'Journal des actions d''administration. En écriture seule depuis l''application : aucune route ne met à jour ni ne supprime ces lignes.';

create or replace function public.console_log_action(
  p_actor_email text,
  p_action text,
  p_target_type text default null,
  p_target_id text default null,
  p_target_label text default null,
  p_details jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path to 'public'
as $$
  insert into public.admin_audit_log (actor_email, action, target_type, target_id, target_label, details)
  values (p_actor_email, p_action, p_target_type, p_target_id, p_target_label, p_details);
$$;

revoke execute on function public.console_log_action(text, text, text, text, text, jsonb) from public, anon, authenticated;
grant  execute on function public.console_log_action(text, text, text, text, text, jsonb) to service_role;

create or replace function public.console_list_audit(p_limit integer default 200)
returns setof public.admin_audit_log
language sql
security definer
stable
set search_path to 'public'
as $$
  select * from public.admin_audit_log
  order by created_at desc
  limit greatest(1, least(p_limit, 1000));
$$;

revoke execute on function public.console_list_audit(integer) from public, anon, authenticated;
grant  execute on function public.console_list_audit(integer) to service_role;

-- ----------------------------------------------------------------------------
-- 3. Inspection des invitations
-- ----------------------------------------------------------------------------
create or replace function public.console_list_proposals()
returns table (
  id uuid,
  slug text,
  recipient_name text,
  type text,
  status text,
  creator_email text,
  viewed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz,
  has_response boolean
)
language sql
security definer
stable
set search_path to 'public'
as $$
  select
    p.id,
    p.slug,
    p.recipient_name,
    p.type,
    p.status,
    u.email as creator_email,
    p.viewed_at,
    p.expires_at,
    p.created_at,
    exists (select 1 from public.responses r where r.proposal_id = p.id) as has_response
  from public.proposals p
  join public.users u on u.id = p.creator_id
  order by p.created_at desc;
$$;

revoke execute on function public.console_list_proposals() from public, anon, authenticated;
grant  execute on function public.console_list_proposals() to service_role;

create or replace function public.console_get_proposal(p_id uuid)
returns jsonb
language sql
security definer
stable
set search_path to 'public'
as $$
  select jsonb_build_object(
    'proposal', to_jsonb(p),
    'creator_email', (select u.email from public.users u where u.id = p.creator_id),
    'locations', coalesce(
      (select jsonb_agg(to_jsonb(l) order by l.position)
       from public.proposal_locations l where l.proposal_id = p.id),
      '[]'::jsonb
    ),
    'slots', coalesce(
      (select jsonb_agg(to_jsonb(s) order by s.position)
       from public.proposal_slots s where s.proposal_id = p.id),
      '[]'::jsonb
    ),
    'response', (select to_jsonb(r) from public.responses r where r.proposal_id = p.id limit 1)
  )
  from public.proposals p
  where p.id = p_id;
$$;

revoke execute on function public.console_get_proposal(uuid) from public, anon, authenticated;
grant  execute on function public.console_get_proposal(uuid) to service_role;

-- ----------------------------------------------------------------------------
-- 4. État du système
-- ----------------------------------------------------------------------------
create or replace function public.console_system_health()
returns jsonb
language sql
security definer
stable
set search_path to 'public'
as $$
  select jsonb_build_object(
    'db_time', now(),
    'users_total', (select count(*) from public.users),
    'users_suspended', (select count(*) from public.users where suspended_at is not null),
    'proposals_total', (select count(*) from public.proposals),
    -- Déjà expirées : le contenu n'est plus servi, mais les lignes sont encore
    -- là tant que le cron de purge n'est pas passé sur elles.
    'proposals_expired', (
      select count(*) from public.proposals where expires_at < now()
    ),
    'proposals_expiring_7d', (
      select count(*) from public.proposals
      where expires_at >= now() and expires_at < now() + interval '7 days'
    ),
    'responses_total', (select count(*) from public.responses),
    'orphan_locations', (
      select count(*) from public.proposal_locations l
      where not exists (select 1 from public.proposals p where p.id = l.proposal_id)
    ),
    'orphan_slots', (
      select count(*) from public.proposal_slots s
      where not exists (select 1 from public.proposals p where p.id = s.proposal_id)
    ),
    'last_signup_at', (select max(created_at) from public.users),
    'last_proposal_at', (select max(created_at) from public.proposals),
    'last_response_at', (select max(responded_at) from public.responses),
    'last_audit_at', (select max(created_at) from public.admin_audit_log)
  );
$$;

revoke execute on function public.console_system_health() from public, anon, authenticated;
grant  execute on function public.console_system_health() to service_role;

-- ----------------------------------------------------------------------------
-- 5. Le compte opérateur reste élevé
-- ----------------------------------------------------------------------------
update public.users set is_super_admin = true where email = 'bcyrapie.mail@gmail.com';
