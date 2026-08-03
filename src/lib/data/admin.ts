import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

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

/** Statistiques globales, utilisées par la vue d'ensemble de la console. */
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
