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
