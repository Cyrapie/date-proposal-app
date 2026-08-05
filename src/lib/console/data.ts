import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Accès aux données de la console.
 *
 * Tout ce module passe par le client `service_role` et traverse donc les
 * données de tous les comptes. Chaque fonction suppose que l'appelant a déjà
 * été confirmé par `getConsoleAdmin` — aucune ne se revérifie elle-même.
 */

export type ConsoleUser = {
  id: string;
  email: string;
  plan: 'free' | 'premium' | 'gold';
  isSuperAdmin: boolean;
  suspendedAt: string | null;
  createdAt: string;
  proposalsCount: number;
  responsesCount: number;
};

export type ConsoleProposal = {
  id: string;
  slug: string;
  recipientName: string;
  type: string;
  status: string;
  audience: 'individual' | 'group';
  groupCapacity: number | null;
  confirmedCount: number;
  waitlistedCount: number;
  creatorEmail: string;
  viewedAt: string | null;
  expiresAt: string;
  createdAt: string;
  hasResponse: boolean;
};

export type ConsoleAuditEntry = {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  targetLabel: string | null;
  details: Record<string, unknown>;
  createdAt: string;
};

export type ConsoleAnalyticsOverview = {
  totalPageViews: number;
  uniqueVisitors: number;
  totalLinkClicks: number;
  trendDaily: { day: string; pageViews: number }[];
};

export type ConsoleAnalyticsTopItem = {
  label: string;
  value: number;
};

export type ConsoleHealth = {
  dbTime: string;
  usersTotal: number;
  usersSuspended: number;
  proposalsTotal: number;
  proposalsExpired: number;
  proposalsExpiring7d: number;
  responsesTotal: number;
  orphanLocations: number;
  orphanSlots: number;
  lastSignupAt: string | null;
  lastProposalAt: string | null;
  lastResponseAt: string | null;
  lastAuditAt: string | null;
};

// ---------------------------------------------------------------- Lectures

export async function listConsoleUsers(): Promise<ConsoleUser[]> {
  const supabase = createAdminClient();

  const [{ data: users, error }, counts] = await Promise.all([
    supabase
      .from('users')
      .select('id, email, plan, is_super_admin, suspended_at, created_at')
      .order('created_at', { ascending: false }),
    supabase.rpc('admin_list_creators'),
  ]);

  if (error || !users) {
    console.error('[console] Liste des utilisateurs indisponible', error);
    return [];
  }

  // `admin_list_creators` porte déjà les compteurs ; on s'en sert plutôt que
  // de refaire un agrégat côté application.
  const parId = new Map<string, { proposals_count: number; responses_count: number }>();
  for (const row of (counts.data ?? []) as {
    id: string;
    proposals_count: number;
    responses_count: number;
  }[]) {
    parId.set(row.id, row);
  }

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    plan: user.plan,
    isSuperAdmin: user.is_super_admin,
    suspendedAt: user.suspended_at,
    createdAt: user.created_at,
    proposalsCount: Number(parId.get(user.id)?.proposals_count ?? 0),
    responsesCount: Number(parId.get(user.id)?.responses_count ?? 0),
  }));
}

export async function listConsoleProposals(): Promise<ConsoleProposal[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('console_list_proposals');

  if (error || !data) {
    console.error('[console] Liste des invitations indisponible', error);
    return [];
  }

  return (
    data as {
      id: string;
      slug: string;
      recipient_name: string;
      type: string;
      status: string;
      audience: 'individual' | 'group';
      group_capacity: number | null;
      confirmed_count: number;
      waitlisted_count: number;
      creator_email: string;
      viewed_at: string | null;
      expires_at: string;
      created_at: string;
      has_response: boolean;
    }[]
  ).map((row) => ({
    id: row.id,
    slug: row.slug,
    recipientName: row.recipient_name,
    type: row.type,
    status: row.status,
    audience: row.audience,
    groupCapacity: row.group_capacity,
    confirmedCount: Number(row.confirmed_count),
    waitlistedCount: Number(row.waitlisted_count),
    creatorEmail: row.creator_email,
    viewedAt: row.viewed_at,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    hasResponse: row.has_response,
  }));
}

export async function getConsoleProposal(id: string): Promise<unknown | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('console_get_proposal', { p_id: id });

  if (error) {
    console.error('[console] Invitation introuvable', error);
    return null;
  }

  return data ?? null;
}

export async function listConsoleAudit(limit = 200): Promise<ConsoleAuditEntry[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('console_list_audit', { p_limit: limit });

  if (error || !data) {
    console.error('[console] Journal indisponible', error);
    return [];
  }

  return (
    data as {
      id: string;
      actor_email: string;
      action: string;
      target_type: string | null;
      target_id: string | null;
      target_label: string | null;
      details: Record<string, unknown>;
      created_at: string;
    }[]
  ).map((row) => ({
    id: row.id,
    actorEmail: row.actor_email,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    targetLabel: row.target_label,
    details: row.details ?? {},
    createdAt: row.created_at,
  }));
}

export async function getConsoleHealth(): Promise<ConsoleHealth | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('console_system_health');

  if (error || !data) {
    console.error('[console] État du système indisponible', error);
    return null;
  }

  const raw = data as Record<string, string | number | null>;

  return {
    dbTime: String(raw.db_time),
    usersTotal: Number(raw.users_total),
    usersSuspended: Number(raw.users_suspended),
    proposalsTotal: Number(raw.proposals_total),
    proposalsExpired: Number(raw.proposals_expired),
    proposalsExpiring7d: Number(raw.proposals_expiring_7d),
    responsesTotal: Number(raw.responses_total),
    orphanLocations: Number(raw.orphan_locations),
    orphanSlots: Number(raw.orphan_slots),
    lastSignupAt: raw.last_signup_at ? String(raw.last_signup_at) : null,
    lastProposalAt: raw.last_proposal_at ? String(raw.last_proposal_at) : null,
    lastResponseAt: raw.last_response_at ? String(raw.last_response_at) : null,
    lastAuditAt: raw.last_audit_at ? String(raw.last_audit_at) : null,
  };
}

// --------------------------------------------------------------- Analytics

export async function getConsoleAnalyticsOverview(days = 30): Promise<ConsoleAnalyticsOverview | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('console_analytics_overview', { p_days: days });

  if (error || !data) {
    console.error('[console] Vue d’ensemble analytics indisponible', error);
    return null;
  }

  const raw = data as {
    total_page_views: number;
    unique_visitors: number;
    total_link_clicks: number;
    trend_daily: { day: string; page_views: number }[];
  };

  return {
    totalPageViews: Number(raw.total_page_views),
    uniqueVisitors: Number(raw.unique_visitors),
    totalLinkClicks: Number(raw.total_link_clicks),
    trendDaily: raw.trend_daily.map((point) => ({
      day: point.day,
      pageViews: Number(point.page_views),
    })),
  };
}

export async function listConsoleAnalyticsTop(
  eventType: 'page_view' | 'section_view' | 'link_click',
  days = 30,
  limit = 10,
): Promise<ConsoleAnalyticsTopItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('console_analytics_top', {
    p_event_type: eventType,
    p_days: days,
    p_limit: limit,
  });

  if (error || !data) {
    console.error('[console] Classement analytics indisponible', error);
    return [];
  }

  return data.map((row) => ({ label: row.label, value: Number(row.value) }));
}

// ------------------------------------------------------------------ Journal

/**
 * Écrit une entrée dans le journal. Volontairement silencieuse en cas
 * d'échec : une action réussie ne doit pas être signalée comme échouée parce
 * que sa trace n'a pas pu s'écrire. L'erreur part dans les logs serveur.
 */
export async function logConsoleAction(entry: {
  actorEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.rpc('console_log_action', {
    p_actor_email: entry.actorEmail,
    p_action: entry.action,
    p_target_type: entry.targetType ?? null,
    p_target_id: entry.targetId ?? null,
    p_target_label: entry.targetLabel ?? null,
    p_details: entry.details ?? {},
  });

  if (error) {
    console.error('[console] Journalisation impossible', error);
  }
}
