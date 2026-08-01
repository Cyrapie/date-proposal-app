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
