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

