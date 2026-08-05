-- ============================================================
-- Migration consolidée — à coller dans le SQL Editor de Supabase
-- Exécuter une seule fois, en une seule fois.
-- ============================================================


-- >>> 20260730120000_init.sql

-- ============================================================================
-- Schéma initial : propositions de rendez-vous
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- users
-- Miroir applicatif de auth.users. Le champ `plan` est présent dès maintenant
-- pour permettre l'activation d'un modèle payant (Stripe) plus tard sans
-- migration de schéma : la contrainte accepte déjà les valeurs futures.
-- ----------------------------------------------------------------------------
create table public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  plan       text not null default 'free',
  created_at timestamptz not null default now(),

  constraint users_plan_check check (plan in ('free', 'pro', 'lifetime'))
);

comment on column public.users.plan is
  'Plan de facturation. Seul ''free'' est utilisé aujourd''hui ; ''pro'' et ''lifetime'' sont réservés pour l''intégration Stripe future.';

-- Création automatique de la ligne applicative à l'inscription Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- proposals
-- ----------------------------------------------------------------------------
create table public.proposals (
  id             uuid primary key default gen_random_uuid(),
  creator_id     uuid not null references public.users (id) on delete cascade,
  recipient_name text not null,
  type           text not null,
  message        text,
  photo_url      text,
  theme          text not null default 'classic',
  slug           text not null unique,
  status         text not null default 'created',
  viewed_at      timestamptz,
  expires_at     timestamptz not null default (now() + interval '30 days'),
  created_at     timestamptz not null default now(),

  constraint proposals_type_check check (
    type in ('cinema', 'restaurant', 'weekend', 'activity', 'surprise', 'birthday', 'just_because')
  ),
  constraint proposals_theme_check check (theme in ('classic', 'fun', 'midnight')),
  constraint proposals_status_check check (status in ('created', 'viewed', 'responded')),
  constraint proposals_recipient_name_check check (char_length(recipient_name) between 1 and 60),
  constraint proposals_message_check check (message is null or char_length(message) <= 2000)
);

create index proposals_creator_id_idx on public.proposals (creator_id, created_at desc);
create index proposals_expires_at_idx on public.proposals (expires_at);

-- ----------------------------------------------------------------------------
-- proposal_locations : 1 à 3 lieux proposés
-- ----------------------------------------------------------------------------
create table public.proposal_locations (
  id          uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  label       text not null,
  address     text,
  position    smallint not null default 0,
  created_at  timestamptz not null default now(),

  constraint proposal_locations_label_check check (char_length(label) between 1 and 120)
);

create index proposal_locations_proposal_id_idx on public.proposal_locations (proposal_id, position);

-- ----------------------------------------------------------------------------
-- proposal_slots : 1 à 5 créneaux proposés
-- ----------------------------------------------------------------------------
create table public.proposal_slots (
  id          uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  position    smallint not null default 0,
  created_at  timestamptz not null default now(),

  constraint proposal_slots_order_check check (end_time > start_time)
);

create index proposal_slots_proposal_id_idx on public.proposal_slots (proposal_id, position);

-- ----------------------------------------------------------------------------
-- responses : une seule réponse par proposition
--
-- `recipient_email` est facultatif : le destinataire n'a pas de compte, mais
-- peut laisser son email pour recevoir sa propre confirmation + .ics.
-- ----------------------------------------------------------------------------
create table public.responses (
  id                 uuid primary key default gen_random_uuid(),
  proposal_id        uuid not null unique references public.proposals (id) on delete cascade,
  chosen_location_id uuid references public.proposal_locations (id) on delete set null,
  chosen_slot_id     uuid references public.proposal_slots (id) on delete set null,
  recipient_note     text,
  recipient_email    text,
  responded_at       timestamptz not null default now(),

  constraint responses_note_check check (recipient_note is null or char_length(recipient_note) <= 1000)
);

create index responses_proposal_id_idx on public.responses (proposal_id);

-- ----------------------------------------------------------------------------
-- RGPD : purge des propositions expirées.
-- À brancher sur pg_cron ou sur un cron Vercel appelant une route protégée.
-- ----------------------------------------------------------------------------
create or replace function public.purge_expired_proposals(grace_days integer default 30)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.proposals
  where expires_at < now() - make_interval(days => grace_days);

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

comment on function public.purge_expired_proposals is
  'Supprime les propositions expirées depuis plus de `grace_days` jours (cascade sur lieux, créneaux et réponses).';

-- >>> 20260730120100_rls.sql

-- ============================================================================
-- Row Level Security
--
-- Principe : le client navigateur (clé anon) ne peut accéder qu'aux données du
-- créateur connecté. Le parcours destinataire est entièrement rendu côté
-- serveur avec la clé `service_role` (qui contourne RLS) : aucune donnée n'est
-- donc exposée à un client anonyme, et le destinataire n'a besoin d'aucun
-- compte.
-- ============================================================================

alter table public.users              enable row level security;
alter table public.proposals          enable row level security;
alter table public.proposal_locations enable row level security;
alter table public.proposal_slots     enable row level security;
alter table public.responses          enable row level security;

-- ----------------------------------------------------------------------------
-- users
-- ----------------------------------------------------------------------------
create policy "users_select_own"
  on public.users for select
  to authenticated
  using (id = (select auth.uid()));

create policy "users_update_own"
  on public.users for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- proposals
-- ----------------------------------------------------------------------------
create policy "proposals_select_own"
  on public.proposals for select
  to authenticated
  using (creator_id = (select auth.uid()));

create policy "proposals_insert_own"
  on public.proposals for insert
  to authenticated
  with check (creator_id = (select auth.uid()));

create policy "proposals_update_own"
  on public.proposals for update
  to authenticated
  using (creator_id = (select auth.uid()))
  with check (creator_id = (select auth.uid()));

create policy "proposals_delete_own"
  on public.proposals for delete
  to authenticated
  using (creator_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- proposal_locations / proposal_slots : accès via la proposition parente
-- ----------------------------------------------------------------------------
create policy "proposal_locations_all_own"
  on public.proposal_locations for all
  to authenticated
  using (
    exists (
      select 1 from public.proposals p
      where p.id = proposal_locations.proposal_id
        and p.creator_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.proposals p
      where p.id = proposal_locations.proposal_id
        and p.creator_id = (select auth.uid())
    )
  );

create policy "proposal_slots_all_own"
  on public.proposal_slots for all
  to authenticated
  using (
    exists (
      select 1 from public.proposals p
      where p.id = proposal_slots.proposal_id
        and p.creator_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.proposals p
      where p.id = proposal_slots.proposal_id
        and p.creator_id = (select auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- responses : le créateur peut lire la réponse reçue.
-- L'écriture se fait exclusivement côté serveur (service_role).
-- ----------------------------------------------------------------------------
create policy "responses_select_own"
  on public.responses for select
  to authenticated
  using (
    exists (
      select 1 from public.proposals p
      where p.id = responses.proposal_id
        and p.creator_id = (select auth.uid())
    )
  );

-- ----------------------------------------------------------------------------
-- Privilèges de table
--
-- RLS filtre les LIGNES ; encore faut-il que le rôle ait accès à la TABLE.
-- Selon le réglage « Data API » du projet, les tables nouvellement créées ne
-- sont pas forcément exposées automatiquement : sans ces GRANT, le dashboard
-- échouerait en « permission denied » malgré des policies correctes.
--
-- `anon` ne reçoit délibérément aucun privilège : le parcours destinataire
-- passe exclusivement par la clé `service_role`, côté serveur.
-- ----------------------------------------------------------------------------
grant usage on schema public to authenticated;

grant select, update                     on public.users              to authenticated;
grant select, insert, update, delete     on public.proposals          to authenticated;
grant select, insert, update, delete     on public.proposal_locations to authenticated;
grant select, insert, update, delete     on public.proposal_slots     to authenticated;
grant select                             on public.responses          to authenticated;

-- >>> 20260730120200_storage.sql

-- ============================================================================
-- Stockage des photos jointes aux propositions
--
-- Le bucket est public en lecture : la photo doit s'afficher pour le
-- destinataire (non authentifié) et dans les emails, où aucune session ne peut
-- être présentée. Les fichiers sont rangés sous `{user_id}/{uuid}.{ext}`, donc
-- non énumérables. Pour un besoin de confidentialité plus strict, passer le
-- bucket en privé et servir des URLs signées.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'proposal-photos',
  'proposal-photos',
  true,
  5242880, -- 5 Mo
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lecture publique
create policy "proposal_photos_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'proposal-photos');

-- Chaque utilisateur connecté n'écrit que dans son propre dossier
create policy "proposal_photos_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'proposal-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "proposal_photos_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'proposal-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "proposal_photos_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'proposal-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- >>> 20260730120300_harden_rpc_grants_and_storage.sql

-- ============================================================================
-- Durcissement de sécurité — appliqué le 2026-07-30 après audit des advisors
-- Supabase sur le projet.
--
-- Trois problèmes corrigés, tous introduits par les migrations précédentes :
--
--   1. CRITIQUE — `purge_expired_proposals` est SECURITY DEFINER et était
--      exécutable par `anon` via /rest/v1/rpc/. La clé anon étant publique
--      (elle est livrée dans le bundle navigateur), n'importe qui pouvait
--      l'appeler. Pire : `grace_days` vient de l'appelant, et une valeur
--      négative déplace la date de coupure dans le futur — `grace_days
--      = -100000` faisait correspondre TOUTES les lignes, donc la
--      suppression complète des propositions et, par cascade, des lieux,
--      créneaux et réponses.
--      La protection par CRON_SECRET sur /api/cron/purge n'y changeait rien :
--      PostgREST expose la fonction directement, court-circuitant la route.
--
--   2. `handle_new_user` (trigger d'inscription) était également appelable
--      via RPC. Risque pratique faible — sans contexte de trigger, `new` est
--      nul et l'appel échoue — mais rien ne justifie de l'exposer.
--
--   3. La policy SELECT du bucket `proposal-photos` autorisait le LISTAGE de
--      tous les objets, donc l'énumération des photos de tous les créateurs.
--      Un bucket public sert ses URLs d'objet sans cette policy.
--
-- Corrigé aussi : `anon` détenait tous les privilèges de table (défaut
-- Supabase). RLS le bloquait déjà faute de policy le ciblant, mais le
-- parcours destinataire passe uniquement par `service_role` — anon n'a besoin
-- d'aucun accès. Défense en profondeur si RLS était désactivé par erreur.
-- ============================================================================

-- 1. Borne `grace_days` à 0 minimum, indépendamment de la révocation.
create or replace function public.purge_expired_proposals(grace_days integer default 30)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  deleted_count integer;
  safe_days integer := greatest(coalesce(grace_days, 30), 0);
begin
  delete from public.proposals
  where expires_at < now() - make_interval(days => safe_days);

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- 2. Seul `service_role` (route cron, côté serveur) peut purger.
revoke execute on function public.purge_expired_proposals(integer) from public, anon, authenticated;
grant  execute on function public.purge_expired_proposals(integer) to service_role;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 3. `anon` ne conserve aucun privilège de table.
revoke all on public.users              from anon;
revoke all on public.proposals          from anon;
revoke all on public.proposal_locations from anon;
revoke all on public.proposal_slots     from anon;
revoke all on public.responses          from anon;

-- 4. Supprime le listage du bucket. Les URLs publiques restent servies.
drop policy if exists "proposal_photos_public_read" on storage.objects;

-- >>> 20260731090000_counter_proposal_and_geolocation.sql

-- ============================================================================
-- Contre-proposition du destinataire, et géolocalisation des lieux.
-- Appliqué le 2026-07-31.
-- ============================================================================

-- 1. Coordonnées facultatives d'un lieu, saisies par le créateur via la
--    géolocalisation du navigateur. Sans clé API : on ne stocke que le point,
--    le lien cartographique est reconstruit à l'affichage.
alter table public.proposal_locations
  add column if not exists latitude  double precision,
  add column if not exists longitude double precision;

alter table public.proposal_locations
  drop constraint if exists proposal_locations_coords_valid;

alter table public.proposal_locations
  add constraint proposal_locations_coords_valid check (
    (latitude is null and longitude is null)
    or (latitude between -90 and 90 and longitude between -180 and 180)
  );

-- 2. Contre-proposition : le destinataire n'a retenu aucun créneau et propose
--    le sien. `chosen_slot_id` reste alors nul, d'où la contrainte ci-dessous
--    qui impose l'un ou l'autre, jamais ni l'un ni l'autre.
alter table public.responses
  add column if not exists proposed_start    timestamptz,
  add column if not exists proposed_end      timestamptz,
  add column if not exists proposed_location text;

alter table public.responses
  drop constraint if exists responses_slot_or_proposal;

alter table public.responses
  add constraint responses_slot_or_proposal check (
    chosen_slot_id is not null
    or (proposed_start is not null and proposed_end is not null)
  );

alter table public.responses
  drop constraint if exists responses_proposed_range;

alter table public.responses
  add constraint responses_proposed_range check (
    proposed_start is null
    or proposed_end is null
    or proposed_end > proposed_start
  );

-- 3. Nouveau statut : une contre-proposition n'est pas une acceptation.
alter table public.proposals
  drop constraint if exists proposals_status_check;

alter table public.proposals
  add constraint proposals_status_check check (
    status in ('created', 'viewed', 'responded', 'countered')
  );

comment on column public.responses.proposed_start is
  'Créneau proposé par le destinataire quand aucun des créneaux offerts ne convient.';
comment on column public.proposal_locations.latitude is
  'Position facultative, saisie via la géolocalisation du navigateur du créateur.';

-- >>> 20260731100000_align_plan_names_and_quota.sql

-- ============================================================================
-- Aligne les identifiants de formule sur la grille tarifaire publique, et
-- ajoute la fonction de comptage servant à faire respecter les plafonds.
-- Appliqué le 2026-07-31.
-- ============================================================================

-- 1. 'pro' et 'lifetime' n'ont jamais été employés. La grille publique parle
--    de Premium et Premium Gold : le code et la base doivent dire pareil.
update public.users set plan = 'premium'  where plan = 'pro';
update public.users set plan = 'gold'     where plan = 'lifetime';

alter table public.users drop constraint if exists users_plan_check;

alter table public.users
  add constraint users_plan_check check (plan in ('free', 'premium', 'gold'));

-- 2. Nombre d'invitations créées par un utilisateur depuis le début du mois
--    civil, en UTC. SECURITY DEFINER pour rester lisible même si les policies
--    évoluent, mais réservé à `authenticated` et `service_role`.
create or replace function public.count_proposals_this_month(target_user uuid)
returns integer
language sql
security definer
stable
set search_path to 'public'
as $$
  select count(*)::integer
  from public.proposals
  where creator_id = target_user
    and created_at >= date_trunc('month', now() at time zone 'utc');
$$;

revoke execute on function public.count_proposals_this_month(uuid) from public, anon;
-- La fonction accepte un identifiant arbitraire : ouverte à `authenticated`,
-- elle permettrait de compter les invitations d'autrui. Le serveur l'appelle
-- exclusivement via `service_role`.
revoke execute on function public.count_proposals_this_month(uuid) from authenticated;
grant  execute on function public.count_proposals_this_month(uuid) to service_role;

-- 3. Un index sur (créateur, date) : le comptage est appelé à chaque création.
create index if not exists proposals_creator_created_idx
  on public.proposals (creator_id, created_at desc);

-- >>> 20260801090000_super_admin_and_stats.sql

-- ============================================================================
-- Super Administrateur : drapeau de compte, et fonctions d'agrégation pour le
-- tableau de bord. Appliqué le 2026-08-01.
--
-- Toutes les fonctions statistiques sont réservées à `service_role` — jamais
-- exposées à `anon` ni `authenticated` via RPC, puisqu'elles traversent les
-- données de tous les utilisateurs.
--
-- Le contrôle d'accès réel se fait dans l'application : la page /admin lit
-- d'abord `users.is_super_admin` via la session normale de l'appelant (RLS,
-- ne voit que sa propre ligne), et n'utilise le client service_role qu'après
-- ce contrôle. Ces fonctions ne sont donc jamais la seule barrière.
-- ============================================================================

alter table public.users
  add column if not exists is_super_admin boolean not null default false;

-- Un seul compte élevé pour l'instant : bcyrapie.mail@gmail.com.
update public.users set is_super_admin = true where email = 'bcyrapie.mail@gmail.com';

-- ----------------------------------------------------------------------------
-- Statistiques globales, en un seul aller-retour.
-- ----------------------------------------------------------------------------
create or replace function public.admin_get_stats()
returns jsonb
language sql
security definer
stable
set search_path to 'public'
as $$
  select jsonb_build_object(
    'total_creators', (select count(*) from public.users),
    'total_proposals', (select count(*) from public.proposals),
    'proposals_this_month', (
      select count(*) from public.proposals
      where created_at >= date_trunc('month', now() at time zone 'utc')
    ),
    'viewed_count', (select count(*) from public.proposals where viewed_at is not null),
    'responded_count', (select count(*) from public.proposals where status in ('responded', 'countered')),
    'by_status', (
      select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
      from (select status, count(*) as n from public.proposals group by status) s
    ),
    'by_type', (
      select coalesce(jsonb_object_agg(type, n), '{}'::jsonb)
      from (select type, count(*) as n from public.proposals group by type) t
    ),
    'by_plan', (
      select coalesce(jsonb_object_agg(plan, n), '{}'::jsonb)
      from (select plan, count(*) as n from public.users group by plan) p
    ),
    'growth_daily', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d, 'signups', signups, 'proposals', props) order by d), '[]'::jsonb)
      from (
        select
          gs.d::date as d,
          (select count(*) from public.users u where u.created_at::date = gs.d) as signups,
          (select count(*) from public.proposals p where p.created_at::date = gs.d) as props
        from generate_series(
          (now() at time zone 'utc')::date - interval '29 days',
          (now() at time zone 'utc')::date,
          interval '1 day'
        ) as gs(d)
      ) days
    )
  );
$$;

revoke execute on function public.admin_get_stats() from public, anon, authenticated;
grant  execute on function public.admin_get_stats() to service_role;

-- ----------------------------------------------------------------------------
-- Liste des créateurs, avec leur activité.
-- ----------------------------------------------------------------------------
create or replace function public.admin_list_creators()
returns table (
  id uuid,
  email text,
  plan text,
  is_super_admin boolean,
  created_at timestamptz,
  proposals_count bigint,
  responses_count bigint
)
language sql
security definer
stable
set search_path to 'public'
as $$
  select
    u.id,
    u.email,
    u.plan,
    u.is_super_admin,
    u.created_at,
    count(p.id) as proposals_count,
    count(r.id) as responses_count
  from public.users u
  left join public.proposals p on p.creator_id = u.id
  left join public.responses r on r.proposal_id = p.id
  group by u.id, u.email, u.plan, u.is_super_admin, u.created_at
  order by u.created_at desc;
$$;

revoke execute on function public.admin_list_creators() from public, anon, authenticated;
grant  execute on function public.admin_list_creators() to service_role;

comment on column public.users.is_super_admin is
  'Accès total au tableau de bord /admin. Attribué manuellement en base, jamais via une action utilisateur.';

-- >>> 20260802100000_console_admin.sql

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

-- >>> 20260802130000_group_invitations.sql

-- ============================================================================
-- Invitations de groupe. Appliqué le 2026-08-02.
--
-- Une invitation individuelle garde exactement le comportement d'avant : un
-- seul créneau accepté, une seule réponse. Une invitation de groupe partage
-- le même mécanisme de lieux/créneaux, mais plusieurs personnes différentes
-- peuvent chacune l'ouvrir et choisir indépendamment, jusqu'à une capacité
-- fixée à la création. Au-delà, elles rejoignent une liste d'attente et sont
-- promues automatiquement si une place confirmée se libère.
--
-- Réservé à la formule Premium Gold — contrôlé côté application
-- (POST /api/proposals), pas ici : la base ne connaît pas les formules
-- suffisamment finement pour être la seule barrière, comme pour le quota
-- mensuel déjà en place.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. `proposals` : audience et capacité
-- ----------------------------------------------------------------------------
alter table public.proposals
  add column if not exists audience text not null default 'individual',
  add column if not exists group_capacity integer;

alter table public.proposals
  add constraint proposals_audience_check
    check (audience in ('individual', 'group'));

alter table public.proposals
  add constraint proposals_group_capacity_check
    check (
      (audience = 'individual' and group_capacity is null)
      or (audience = 'group' and group_capacity between 2 and 50)
    );

-- Remplace l'ancienne contrainte : les types de groupe ne sont valides que
-- pour une invitation de groupe, et réciproquement pour les types existants.
alter table public.proposals drop constraint proposals_type_check;
alter table public.proposals
  add constraint proposals_type_check
    check (
      (audience = 'individual' and type in (
        'cinema', 'restaurant', 'weekend', 'activity', 'surprise', 'birthday', 'just_because'
      ))
      or (audience = 'group' and type in (
        'friends', 'club', 'colleagues', 'events', 'chill', 'afterwork'
      ))
    );

comment on column public.proposals.audience is
  'individual (comportement historique, une réponse) ou group (plusieurs participants, capacité fixée).';
comment on column public.proposals.group_capacity is
  'Nombre de places confirmées pour une invitation de groupe. Nul pour une invitation individuelle.';

-- ----------------------------------------------------------------------------
-- 2. `responses` : plusieurs réponses par invitation, liste d'attente
-- ----------------------------------------------------------------------------
alter table public.responses drop constraint responses_proposal_id_key;

alter table public.responses
  add column if not exists status text not null default 'confirmed',
  add column if not exists participant_name text,
  add column if not exists cancel_token text;

alter table public.responses
  add constraint responses_status_check check (status in ('confirmed', 'waitlisted'));
alter table public.responses
  add constraint responses_participant_name_check
    check (participant_name is null or char_length(participant_name) between 1 and 60);
alter table public.responses
  add constraint responses_cancel_token_key unique (cancel_token);

create index responses_proposal_status_idx on public.responses (proposal_id, status);

comment on column public.responses.status is
  'confirmed ou waitlisted. Toujours confirmed pour une invitation individuelle.';
comment on column public.responses.participant_name is
  'Prénom du participant, demandé uniquement sur une invitation de groupe pour distinguer les réponses.';
comment on column public.responses.cancel_token is
  'Jeton opaque permettant à un participant de groupe d''annuler sa venue sans compte. Nul hors invitation de groupe.';

-- ----------------------------------------------------------------------------
-- 3. Acceptation atomique, individuelle ou de groupe
--
-- Le verrou posé sur la ligne de la proposition sérialise les acceptations
-- concurrentes : deux personnes qui cliquent à la même seconde sur la
-- dernière place d'un groupe ne peuvent pas toutes les deux devenir
-- confirmées. Remplace l'insertion directe faite jusqu'ici par la route
-- /api/d/[slug]/respond.
-- ----------------------------------------------------------------------------
create or replace function public.respond_to_proposal(
  p_proposal_id uuid,
  p_chosen_location_id uuid,
  p_chosen_slot_id uuid,
  p_recipient_note text,
  p_recipient_email text,
  p_proposed_start timestamptz,
  p_proposed_end timestamptz,
  p_proposed_location text,
  p_participant_name text
)
returns table (
  response_id uuid,
  response_status text,
  response_cancel_token text,
  response_waitlist_position integer
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_audience text;
  v_capacity integer;
  v_confirmed_count integer;
  v_status text;
  v_id uuid;
  v_token text;
  v_position integer := null;
begin
  select audience, group_capacity into v_audience, v_capacity
  from public.proposals
  where id = p_proposal_id
  for update;

  if not found then
    raise exception 'proposal_not_found';
  end if;

  if v_audience = 'individual' then
    if exists (select 1 from public.responses where proposal_id = p_proposal_id) then
      raise exception 'already_responded';
    end if;
    v_status := 'confirmed';
  else
    select count(*) into v_confirmed_count
    from public.responses
    where proposal_id = p_proposal_id and status = 'confirmed';

    if v_confirmed_count < v_capacity then
      v_status := 'confirmed';
    else
      v_status := 'waitlisted';
      select count(*) + 1 into v_position
      from public.responses
      where proposal_id = p_proposal_id and status = 'waitlisted';
    end if;

    -- Encodage base64 standard rendu compatible URL : pas de +, /, ni de
    -- padding =, pour aller tel quel dans un lien d'email sans échappement.
    v_token := rtrim(
      replace(replace(encode(extensions.gen_random_bytes(24), 'base64'), '+', '-'), '/', '_'),
      '='
    );
  end if;

  insert into public.responses (
    proposal_id, chosen_location_id, chosen_slot_id, recipient_note, recipient_email,
    proposed_start, proposed_end, proposed_location, participant_name, status, cancel_token
  ) values (
    p_proposal_id, p_chosen_location_id, p_chosen_slot_id, p_recipient_note, p_recipient_email,
    p_proposed_start, p_proposed_end, p_proposed_location, p_participant_name, v_status, v_token
  )
  returning id into v_id;

  update public.proposals
  set status = 'responded'
  where id = p_proposal_id and status in ('created', 'viewed');

  return query select v_id, v_status, v_token, v_position;
end;
$$;

revoke execute on function public.respond_to_proposal(
  uuid, uuid, uuid, text, text, timestamptz, timestamptz, text, text
) from public, anon, authenticated;
grant execute on function public.respond_to_proposal(
  uuid, uuid, uuid, text, text, timestamptz, timestamptz, text, text
) to service_role;

-- ----------------------------------------------------------------------------
-- 4. Promotion depuis la liste d'attente, partagée par l'annulation
--    destinataire et le retrait depuis la console.
-- ----------------------------------------------------------------------------
create or replace function public._promote_next_waitlisted(p_proposal_id uuid)
returns table (promoted_id uuid, promoted_email text, promoted_participant_name text)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_id uuid;
  v_email text;
  v_name text;
begin
  select id, recipient_email, participant_name into v_id, v_email, v_name
  from public.responses
  where proposal_id = p_proposal_id and status = 'waitlisted'
  order by responded_at asc
  limit 1
  for update;

  if v_id is not null then
    update public.responses set status = 'confirmed' where id = v_id;
  end if;

  return query select v_id, v_email, v_name;
end;
$$;

revoke execute on function public._promote_next_waitlisted(uuid) from public, anon, authenticated;
grant execute on function public._promote_next_waitlisted(uuid) to service_role;

-- ----------------------------------------------------------------------------
-- 5. Annulation par le participant lui-même (lien dans son email de
--    confirmation), et retrait depuis la console.
-- ----------------------------------------------------------------------------
create or replace function public.cancel_group_response(p_response_id uuid, p_cancel_token text)
returns table (
  cancelled boolean,
  promoted_id uuid,
  promoted_email text,
  promoted_participant_name text
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_proposal_id uuid;
  v_status text;
  v_stored_token text;
  v_promo record;
begin
  select proposal_id, status, cancel_token into v_proposal_id, v_status, v_stored_token
  from public.responses
  where id = p_response_id;

  if not found or v_stored_token is null or v_stored_token <> p_cancel_token then
    return query select false, null::uuid, null::text, null::text;
    return;
  end if;

  perform 1 from public.proposals where id = v_proposal_id for update;
  delete from public.responses where id = p_response_id;

  if v_status = 'confirmed' then
    select * into v_promo from public._promote_next_waitlisted(v_proposal_id);
    return query select true, v_promo.promoted_id, v_promo.promoted_email, v_promo.promoted_participant_name;
  else
    return query select true, null::uuid, null::text, null::text;
  end if;
end;
$$;

revoke execute on function public.cancel_group_response(uuid, text) from public, anon, authenticated;
grant execute on function public.cancel_group_response(uuid, text) to service_role;

create or replace function public.console_remove_group_response(p_response_id uuid)
returns table (
  proposal_id uuid,
  promoted_id uuid,
  promoted_email text,
  promoted_participant_name text
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_proposal_id uuid;
  v_status text;
  v_promo record;
begin
  -- Qualifié explicitement : le nom de colonne en sortie de cette fonction
  -- est lui-même `proposal_id`, ce qui rend `responses.proposal_id` ambigu
  -- si on ne le préfixe pas (PL/pgSQL expose les colonnes de RETURNS TABLE
  -- comme des variables du même nom dans tout le corps de la fonction).
  select responses.proposal_id, responses.status into v_proposal_id, v_status
  from public.responses
  where id = p_response_id;

  if not found then
    return;
  end if;

  perform 1 from public.proposals where id = v_proposal_id for update;
  delete from public.responses where id = p_response_id;

  if v_status = 'confirmed' then
    select * into v_promo from public._promote_next_waitlisted(v_proposal_id);
    return query select v_proposal_id, v_promo.promoted_id, v_promo.promoted_email, v_promo.promoted_participant_name;
  else
    return query select v_proposal_id, null::uuid, null::text, null::text;
  end if;
end;
$$;

revoke execute on function public.console_remove_group_response(uuid) from public, anon, authenticated;
grant execute on function public.console_remove_group_response(uuid) to service_role;

-- ----------------------------------------------------------------------------
-- 6. Console : listes et détail enrichis de l'audience et des compteurs.
--    Le type de retour change, donc `create or replace` ne suffit pas pour
--    `console_list_proposals` — il faut la reposer.
-- ----------------------------------------------------------------------------
drop function if exists public.console_list_proposals();

create function public.console_list_proposals()
returns table (
  id uuid,
  slug text,
  recipient_name text,
  type text,
  status text,
  audience text,
  group_capacity integer,
  confirmed_count bigint,
  waitlisted_count bigint,
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
    p.audience,
    p.group_capacity,
    (select count(*) from public.responses r where r.proposal_id = p.id and r.status = 'confirmed'),
    (select count(*) from public.responses r where r.proposal_id = p.id and r.status = 'waitlisted'),
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
grant execute on function public.console_list_proposals() to service_role;

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
    -- `responses` (au pluriel) remplace l'ancien `response` singulier : une
    -- invitation de groupe en a potentiellement plusieurs.
    'responses', coalesce(
      (select jsonb_agg(to_jsonb(r) order by r.responded_at)
       from public.responses r where r.proposal_id = p.id),
      '[]'::jsonb
    )
  )
  from public.proposals p
  where p.id = p_id;
$$;

revoke execute on function public.console_get_proposal(uuid) from public, anon, authenticated;
grant execute on function public.console_get_proposal(uuid) to service_role;

-- >>> 20260803090000_close_users_self_update.sql

-- ============================================================================
-- Ferme l'écriture directe sur `public.users` par un utilisateur connecté.
--
-- `users_update_own` (migration 20260730120100) restreignait la LIGNE
-- modifiable (id = auth.uid()) mais pas les COLONNES : n'importe quel créateur
-- pouvait, par un appel PostgREST direct (hors de l'application, avec sa
-- propre clé anon et son propre jeton), écrire `plan`, `is_super_admin` ou
-- `suspended_at` sur sa propre ligne — élévation de privilèges et
-- contournement complet du palier payant.
--
-- Aucune écriture légitime ne passe par la session de l'appelant : les deux
-- seuls endroits qui modifient `users` (`setCreatorPlan`, `setUserPlan`,
-- `setUserSuspended`, `deleteUser`) utilisent déjà `createAdminClient()`
-- (`service_role`, qui contourne RLS). La table devient donc en lecture seule
-- pour `authenticated`, à la fois par la policy et par le grant — retirer
-- seulement l'un des deux laisserait une porte si l'autre était rétabli par
-- erreur plus tard.
-- ============================================================================

drop policy if exists "users_update_own" on public.users;

revoke update on public.users from authenticated;

-- >>> 20260805090000_analytics_events.sql

-- ============================================================================
-- Analytics maison (self-hosted). Appliqué le 2026-08-05.
--
-- Une seule table à trois types d'événement (page_view, section_view,
-- link_click) plutôt que trois tables séparées : les trois se lisent avec la
-- même forme de requête (filtrer par type + fenêtre de temps, regrouper par
-- une clé), donc les séparer n'apporterait aucune clarté et doublerait les
-- migrations à chaque évolution du schéma.
--
-- Écriture directe par `service_role` depuis /api/track (pas de RPC d'écriture
-- : /api/track valide déjà la forme via Zod, et service_role contourne RLS de
-- toute façon). Lecture uniquement via fonctions `console_analytics_*`,
-- réservées à `service_role` comme le reste de la console.
--
-- Aucune IP, aucun user-agent, aucun referrer : seul un identifiant de visite
-- généré côté client (sessionStorage, jamais un cookie persistant) et,
-- lorsqu'il est déjà connu par ailleurs (pages authentifiées), l'id du
-- créateur connecté.
-- ============================================================================

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_view', 'section_view', 'link_click')),
  -- `usePathname()` côté client : sans query string, sans slash final superflu.
  path text not null check (char_length(path) between 1 and 300),
  -- Identifiant de la section ou du lien suivi (attribut `data-track-*`).
  -- Nul pour un `page_view`.
  target_id text check (target_id is null or char_length(target_id) <= 200),
  target_label text check (target_label is null or char_length(target_label) <= 200),
  -- Destination du lien, uniquement pour `link_click`.
  target_href text check (target_href is null or char_length(target_href) <= 500),
  -- Généré côté client, stocké en sessionStorage : distingue les visites au
  -- sein d'un même onglet sans persister au-delà de la session.
  visitor_id uuid not null,
  -- Rempli côté serveur (session du créateur) si connu, jamais fourni par le
  -- client. `set null` : l'historique agrégé survit à la suppression du
  -- compte, seule l'attribution nominative disparaît.
  user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Un seul index composite : toutes les requêtes de lecture filtrent d'abord
-- par event_type puis par fenêtre de temps, avant de regrouper en mémoire par
-- path ou target_*.
create index if not exists analytics_events_event_type_created_at_idx
  on public.analytics_events (event_type, created_at desc);

alter table public.analytics_events enable row level security;

-- Aucune policy : comme `admin_audit_log`, anon/authenticated n'ont aucun
-- accès. Seul `service_role` (contourne RLS) lit et écrit, depuis
-- /api/track et depuis les fonctions console_analytics_*.
comment on table public.analytics_events is
  'Événements analytics maison (vues de page, vues de section, clics de lien). Écrit par /api/track via service_role, jamais par l''application côté RLS.';

-- ----------------------------------------------------------------------------
-- Vue d'ensemble : totaux + série journalière, sur une fenêtre de p_days jours.
-- ----------------------------------------------------------------------------
create or replace function public.console_analytics_overview(p_days integer default 30)
returns jsonb
language sql
security definer
stable
set search_path to 'public'
as $$
  select jsonb_build_object(
    'total_page_views', (
      select count(*) from public.analytics_events
      where event_type = 'page_view'
        and created_at >= now() - make_interval(days => greatest(1, p_days))
    ),
    'unique_visitors', (
      select count(distinct visitor_id) from public.analytics_events
      where event_type = 'page_view'
        and created_at >= now() - make_interval(days => greatest(1, p_days))
    ),
    'total_link_clicks', (
      select count(*) from public.analytics_events
      where event_type = 'link_click'
        and created_at >= now() - make_interval(days => greatest(1, p_days))
    ),
    'trend_daily', (
      select coalesce(
        jsonb_agg(jsonb_build_object('day', d, 'page_views', pv) order by d),
        '[]'::jsonb
      )
      from (
        select
          gs.d::date as d,
          (select count(*) from public.analytics_events e
             where e.event_type = 'page_view' and e.created_at::date = gs.d) as pv
        from generate_series(
          (now() at time zone 'utc')::date - (greatest(1, p_days) - 1) * interval '1 day',
          (now() at time zone 'utc')::date,
          interval '1 day'
        ) as gs(d)
      ) days
    )
  );
$$;

revoke execute on function public.console_analytics_overview(integer) from public, anon, authenticated;
grant  execute on function public.console_analytics_overview(integer) to service_role;

-- ----------------------------------------------------------------------------
-- Top N par étiquette, pour un type d'événement donné.
--
-- `page_view` se regroupe par chemin ; `section_view` et `link_click` se
-- regroupent par étiquette lisible (avec repli sur l'id technique si aucune
-- étiquette n'a été fournie). Une seule fonction couvre les trois panneaux
-- « top pages / top sections / top liens » de la console, en faisant varier
-- p_event_type — pas besoin de trois fonctions quasi identiques.
-- ----------------------------------------------------------------------------
create or replace function public.console_analytics_top(
  p_event_type text,
  p_days integer default 30,
  p_limit integer default 10
)
returns table (label text, value bigint)
language sql
security definer
stable
set search_path to 'public'
as $$
  select
    case
      when p_event_type = 'page_view' then path
      else coalesce(target_label, target_id, '(sans étiquette)')
    end as label,
    count(*) as value
  from public.analytics_events
  where event_type = p_event_type
    and created_at >= now() - make_interval(days => greatest(1, p_days))
  group by 1
  order by value desc
  limit greatest(1, least(p_limit, 50));
$$;

revoke execute on function public.console_analytics_top(text, integer, integer) from public, anon, authenticated;
grant  execute on function public.console_analytics_top(text, integer, integer) to service_role;
