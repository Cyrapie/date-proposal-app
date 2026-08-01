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
