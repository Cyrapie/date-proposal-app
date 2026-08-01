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
