import 'server-only';

import { planFor, type PlanId, type PlanTier } from '@/lib/domain/pricing';
import { createAdminClient } from '@/lib/supabase/admin';

export type QuotaState = {
  plan: PlanTier;
  /** Invitations créées depuis le début du mois civil, en UTC. */
  used: number;
  remaining: number;
  reached: boolean;
  /** Date de remise à zéro, soit le premier du mois suivant. */
  resetsAt: Date;
};

function startOfNextMonthUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

/**
 * État du quota mensuel d'un créateur.
 *
 * Le comptage passe par le client `service_role` : la fonction SQL est
 * `SECURITY DEFINER` et le résultat ne dépend pas des policies. En cas
 * d'échec de lecture, on renvoie un quota non atteint plutôt que de bloquer
 * la création : mieux vaut laisser passer une invitation de trop qu'empêcher
 * un utilisateur légitime d'en créer une.
 */
export async function getQuotaState(
  userId: string,
  planId: PlanId = 'free',
): Promise<QuotaState> {
  const plan = planFor(planId);
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('count_proposals_this_month', {
    target_user: userId,
  });

  if (error) {
    console.error('[quota] Comptage impossible', error);
    return {
      plan,
      used: 0,
      remaining: plan.maxInvitations,
      reached: false,
      resetsAt: startOfNextMonthUtc(),
    };
  }

  const used = typeof data === 'number' ? data : 0;

  return {
    plan,
    used,
    remaining: Math.max(0, plan.maxInvitations - used),
    reached: used >= plan.maxInvitations,
    resetsAt: startOfNextMonthUtc(),
  };
}

/** Formule du créateur, telle qu'enregistrée. Retombe sur 'free'. */
export async function getUserPlan(userId: string): Promise<PlanId> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('users')
    .select('plan')
    .eq('id', userId)
    .maybeSingle();

  const plan = data?.plan;
  return plan === 'premium' || plan === 'gold' ? plan : 'free';
}
