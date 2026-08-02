'use server';

import { revalidatePath } from 'next/cache';

import { getConsoleAdmin } from '@/lib/console/guard';
import { logConsoleAction } from '@/lib/console/data';
import { createAdminClient } from '@/lib/supabase/admin';

export type ActionResult = { ok: boolean; message?: string };

async function exigerAdmin() {
  const admin = await getConsoleAdmin();
  if (!admin) throw new Error('Accès refusé.');
  return admin;
}

/**
 * Coupe l'accès à une invitation sans la détruire : on ramène sa date
 * d'expiration à maintenant. Le contenu cesse d'être servi, mais la trace et
 * la réponse éventuelle restent consultables ici.
 */
export async function expireProposal(proposalId: string): Promise<ActionResult> {
  const admin = await exigerAdmin();
  const supabase = createAdminClient();

  const { data: avant } = await supabase
    .from('proposals')
    .select('slug, recipient_name')
    .eq('id', proposalId)
    .maybeSingle();

  const { error } = await supabase
    .from('proposals')
    .update({ expires_at: new Date().toISOString() })
    .eq('id', proposalId);

  if (error) {
    console.error('[console] Désactivation impossible', error);
    return { ok: false, message: error.message };
  }

  await logConsoleAction({
    actorEmail: admin.email,
    action: 'proposal.expired',
    targetType: 'proposal',
    targetId: proposalId,
    targetLabel: avant?.slug,
    details: { recipient: avant?.recipient_name },
  });

  revalidatePath('/console/invitations');
  return { ok: true };
}

/** Suppression définitive d'une invitation, lieux, créneaux et réponse compris. */
export async function deleteProposal(
  proposalId: string,
  confirmation: string,
): Promise<ActionResult> {
  const admin = await exigerAdmin();
  const supabase = createAdminClient();

  const { data: avant } = await supabase
    .from('proposals')
    .select('slug, recipient_name')
    .eq('id', proposalId)
    .maybeSingle();

  if (!avant) return { ok: false, message: 'Invitation introuvable.' };

  if (confirmation.trim() !== avant.slug) {
    return { ok: false, message: 'L’identifiant saisi ne correspond pas.' };
  }

  const { error } = await supabase.from('proposals').delete().eq('id', proposalId);

  if (error) {
    console.error('[console] Suppression impossible', error);
    return { ok: false, message: error.message };
  }

  await logConsoleAction({
    actorEmail: admin.email,
    action: 'proposal.deleted',
    targetType: 'proposal',
    targetId: proposalId,
    targetLabel: avant.slug,
    details: { recipient: avant.recipient_name },
  });

  revalidatePath('/console/invitations');
  return { ok: true };
}
