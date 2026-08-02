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
