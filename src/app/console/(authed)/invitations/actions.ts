'use server';

import { revalidatePath } from 'next/cache';

import { getConsoleAdmin } from '@/lib/console/guard';
import { logConsoleAction } from '@/lib/console/data';
import { getProposalBySlug } from '@/lib/data/proposals';
import { notifyPromotedParticipant } from '@/lib/data/group-promotion';
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

/**
 * Retire un participant d'une invitation de groupe. Si sa place était
 * confirmée, la personne suivante sur liste d'attente est promue et
 * prévenue par email — la même mécanique que l'auto-annulation, déclenchée
 * ici par un opérateur plutôt que par le participant lui-même.
 */
export async function removeGroupParticipant(
  proposalId: string,
  responseId: string,
): Promise<ActionResult> {
  const admin = await exigerAdmin();
  const supabase = createAdminClient();

  const { data: before } = await supabase
    .from('responses')
    .select('participant_name, status')
    .eq('id', responseId)
    .maybeSingle();

  const { data, error } = await supabase.rpc('console_remove_group_response', {
    p_response_id: responseId,
  });

  if (error) {
    console.error('[console] Retrait impossible', error);
    return { ok: false, message: error.message };
  }

  const result = data?.[0];
  if (!result?.proposal_id) {
    return { ok: false, message: 'Réponse introuvable.' };
  }

  await logConsoleAction({
    actorEmail: admin.email,
    action: 'group_response.removed',
    targetType: 'response',
    targetId: responseId,
    targetLabel: before?.participant_name ?? undefined,
    details: { previous_status: before?.status, promoted: Boolean(result.promoted_id) },
  });

  if (result.promoted_id && result.promoted_email) {
    const { data: proposalRow } = await supabase
      .from('proposals')
      .select('slug')
      .eq('id', proposalId)
      .maybeSingle();

    const proposal = proposalRow ? await getProposalBySlug(proposalRow.slug) : null;
    if (proposal) {
      void notifyPromotedParticipant(
        proposal,
        result.promoted_id,
        result.promoted_email,
        result.promoted_participant_name ?? '',
      );
    }
  }

  revalidatePath(`/console/invitations/${proposalId}`);
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
