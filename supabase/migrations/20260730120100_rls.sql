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
