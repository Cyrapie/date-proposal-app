import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import type {
  FullProposal,
  ProposalLocationRow,
  ProposalRow,
  ProposalSlotRow,
  ResponseRow,
} from '@/lib/supabase/database.types';

/**
 * Charge une proposition par son slug, avec lieux, créneaux et réponse.
 * Utilise le client `service_role` : le destinataire n'a pas de session.
 */
export async function getProposalBySlug(slug: string): Promise<FullProposal | null> {
  const supabase = createAdminClient();

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!proposal) return null;

  const [locations, slots, responses] = await Promise.all([
    supabase
      .from('proposal_locations')
      .select('*')
      .eq('proposal_id', proposal.id)
      .order('position', { ascending: true }),
    supabase
      .from('proposal_slots')
      .select('*')
      .eq('proposal_id', proposal.id)
      .order('position', { ascending: true }),
    // Un tableau, jamais `.maybeSingle()` : une invitation de groupe porte
    // potentiellement plusieurs réponses.
    supabase
      .from('responses')
      .select('*')
      .eq('proposal_id', proposal.id)
      .order('responded_at', { ascending: true }),
  ]);

  if (locations.error) throw locations.error;
  if (slots.error) throw slots.error;
  if (responses.error) throw responses.error;

  return {
    ...(proposal as ProposalRow),
    locations: (locations.data ?? []) as ProposalLocationRow[],
    slots: (slots.data ?? []) as ProposalSlotRow[],
    responses: (responses.data ?? []) as ResponseRow[],
  };
}

export function isExpired(proposal: Pick<ProposalRow, 'expires_at'>): boolean {
  return new Date(proposal.expires_at).getTime() < Date.now();
}

/**
 * Marque la proposition comme « vue » à la première ouverture du lien.
 * Idempotent : une proposition déjà vue ou déjà répondue n'est pas modifiée,
 * ce qui préserve l'horodatage de la première ouverture.
 */
export async function markProposalViewed(proposalId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('proposals')
    .update({ status: 'viewed', viewed_at: new Date().toISOString() })
    .eq('id', proposalId)
    .eq('status', 'created');

  if (error) throw error;
}
