import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export type AdminStats = {
  totalCreators: number;
  totalProposals: number;
  proposalsThisMonth: number;
  viewedCount: number;
  respondedCount: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPlan: Record<string, number>;
  growthDaily: { day: string; signups: number; proposals: number }[];
};

export type AdminCreator = {
  id: string;
  email: string;
  plan: 'free' | 'premium' | 'gold';
  isSuperAdmin: boolean;
  createdAt: string;
  proposalsCount: number;
  responsesCount: number;
};

/**
 * Seul point de décision « cette personne est-elle super-admin ? ».
 *
 * Passe par la session normale de l'appelant (RLS : il ne peut lire que sa
 * propre ligne), jamais par le client `service_role`. Tout le reste de ce
 * module suppose que cette fonction a déjà répondu `true` avant d'être
 * appelé — elle ne se revérifie pas elle-même plus loin.
 */
export async function getCurrentSuperAdmin(): Promise<{ id: string; email: string } | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, is_super_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[admin] Lecture du profil impossible', error);
    return null;
  }

  if (!data?.is_super_admin) return null;
  return { id: data.id, email: data.email };
}

/**
 * Statistiques globales. Réservé à un appelant déjà confirmé super-admin par
 * `getCurrentSuperAdmin` — cette fonction ne le revérifie pas.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('admin_get_stats');

  if (error || !data) {
    console.error('[admin] Statistiques indisponibles', error);
    return {
      totalCreators: 0,
      totalProposals: 0,
      proposalsThisMonth: 0,
      viewedCount: 0,
      respondedCount: 0,
      byStatus: {},
      byType: {},
      byPlan: {},
      growthDaily: [],
    };
  }

  const raw = data as {
    total_creators: number;
    total_proposals: number;
    proposals_this_month: number;
    viewed_count: number;
    responded_count: number;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    by_plan: Record<string, number>;
    growth_daily: { day: string; signups: number; proposals: number }[];
  };

  return {
    totalCreators: raw.total_creators,
    totalProposals: raw.total_proposals,
    proposalsThisMonth: raw.proposals_this_month,
    viewedCount: raw.viewed_count,
    respondedCount: raw.responded_count,
    byStatus: raw.by_status,
    byType: raw.by_type,
    byPlan: raw.by_plan,
    growthDaily: raw.growth_daily,
  };
}

export async function getAdminCreators(): Promise<AdminCreator[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('admin_list_creators');

  if (error || !data) {
    console.error('[admin] Liste des créateurs indisponible', error);
    return [];
  }

  return (
    data as {
      id: string;
      email: string;
      plan: string;
      is_super_admin: boolean;
      created_at: string;
      proposals_count: number;
      responses_count: number;
    }[]
  ).map((row) => ({
    id: row.id,
    email: row.email,
    plan: row.plan as AdminCreator['plan'],
    isSuperAdmin: row.is_super_admin,
    createdAt: row.created_at,
    proposalsCount: row.proposals_count,
    responsesCount: row.responses_count,
  }));
}

/**
 * Change la formule d'un créateur. Seule action d'écriture du tableau de bord
 * pour l'instant : elle sert à faire manuellement ce que Stripe fera plus
 * tard (paiement mobile money confirmé hors-ligne, par exemple).
 */
export async function setCreatorPlan(
  userId: string,
  plan: 'free' | 'premium' | 'gold',
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('users').update({ plan }).eq('id', userId);

  if (error) {
    console.error('[admin] Changement de formule impossible', error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
