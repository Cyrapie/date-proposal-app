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
