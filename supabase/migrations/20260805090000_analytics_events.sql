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
