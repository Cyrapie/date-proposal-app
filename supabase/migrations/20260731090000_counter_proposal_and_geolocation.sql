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
