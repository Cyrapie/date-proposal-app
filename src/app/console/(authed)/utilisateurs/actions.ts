'use server';

import { revalidatePath } from 'next/cache';

import { getConsoleAdmin } from '@/lib/console/guard';
import { logConsoleAction } from '@/lib/console/data';
import { createAdminClient } from '@/lib/supabase/admin';

export type ActionResult = { ok: boolean; message?: string };

const PLANS = ['free', 'premium', 'gold'] as const;
type Plan = (typeof PLANS)[number];

/**
 * Chaque action refait le contrôle d'accès pour son propre compte : une Server
 * Action est une route HTTP à part entière, atteignable sans passer par le
 * rendu de la page qui l'expose. S'appuyer sur la garde du layout laisserait
 * un trou.
 */
async function exigerAdmin() {
  const admin = await getConsoleAdmin();
  if (!admin) throw new Error('Accès refusé.');
  return admin;
}

/** Lit l'email d'un compte pour l'inscrire au journal avant modification. */
async function emailDe(userId: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from('users').select('email').eq('id', userId).maybeSingle();
  return data?.email ?? null;
}

export async function setUserPlan(userId: string, plan: string): Promise<ActionResult> {
  const admin = await exigerAdmin();

  if (!PLANS.includes(plan as Plan)) {
    return { ok: false, message: 'Formule inconnue.' };
  }

  const cible = await emailDe(userId);
  const supabase = createAdminClient();
  const { error } = await supabase.from('users').update({ plan: plan as Plan }).eq('id', userId);

  if (error) {
    console.error('[console] Changement de formule impossible', error);
    return { ok: false, message: error.message };
  }

  await logConsoleAction({
    actorEmail: admin.email,
    action: 'user.plan_changed',
    targetType: 'user',
    targetId: userId,
    targetLabel: cible ?? undefined,
    details: { plan },
  });

  revalidatePath('/console/utilisateurs');
  return { ok: true };
}

export async function setUserSuspended(
  userId: string,
  suspended: boolean,
): Promise<ActionResult> {
  const admin = await exigerAdmin();

  // Se suspendre soi-même fermerait la porte de l'extérieur, sans moyen de
  // revenir depuis l'interface.
  if (userId === admin.id) {
    return { ok: false, message: 'Impossible de suspendre le compte opérateur.' };
  }

  const cible = await emailDe(userId);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('users')
    .update({ suspended_at: suspended ? new Date().toISOString() : null })
    .eq('id', userId);

  if (error) {
    console.error('[console] Suspension impossible', error);
    return { ok: false, message: error.message };
  }

  await logConsoleAction({
    actorEmail: admin.email,
    action: suspended ? 'user.suspended' : 'user.unsuspended',
    targetType: 'user',
    targetId: userId,
    targetLabel: cible ?? undefined,
  });

  revalidatePath('/console/utilisateurs');
  return { ok: true };
}

/**
 * Suppression définitive : le compte d'authentification part, et les
 * invitations suivent par cascade sur `users.id`. Irréversible — l'interface
 * exige de retaper l'adresse avant d'appeler cette action.
 */
export async function deleteUser(userId: string, confirmation: string): Promise<ActionResult> {
  const admin = await exigerAdmin();

  if (userId === admin.id) {
    return { ok: false, message: 'Impossible de supprimer le compte opérateur.' };
  }

  const cible = await emailDe(userId);
  if (!cible) return { ok: false, message: 'Compte introuvable.' };

  if (confirmation.trim().toLowerCase() !== cible.toLowerCase()) {
    return { ok: false, message: 'L’adresse saisie ne correspond pas.' };
  }

  const supabase = createAdminClient();

  // Compté avant la suppression : après, l'information n'existe plus.
  const { count } = await supabase
    .from('proposals')
    .select('id', { count: 'exact', head: true })
    .eq('creator_id', userId);

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    console.error('[console] Suppression impossible', error);
    return { ok: false, message: error.message };
  }

  await logConsoleAction({
    actorEmail: admin.email,
    action: 'user.deleted',
    targetType: 'user',
    targetId: userId,
    targetLabel: cible,
    details: { proposals_removed: count ?? 0 },
  });

  revalidatePath('/console/utilisateurs');
  return { ok: true };
}
