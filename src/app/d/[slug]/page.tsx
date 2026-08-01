import { notFound } from 'next/navigation';

import { RecipientExperience } from '@/components/recipient/RecipientExperience';
import type { ConfirmedResponse, PublicProposal } from '@/components/recipient/types';
import { ExpiredLink } from '@/components/recipient/ExpiredLink';
import { googleCalendarUrl } from '@/lib/calendar/google';
import { mapsUrl } from '@/lib/domain/geo';
import { getProposalBySlug, isExpired } from '@/lib/data/proposals';
import { HIDDEN_LOCATION_TYPES } from '@/lib/domain/proposal';
import { proposalUrl } from '@/lib/domain/slug';
import { publicEnv } from '@/lib/env';

/** Chaque ouverture doit être fraîche : le statut « vue » en dépend. */
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Une invitation pour toi',
  robots: { index: false, follow: false },
};

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const proposal = await getProposalBySlug(slug);

  if (!proposal) {
    notFound();
  }

  // Un lien expiré n'est plus consultable : le contenu n'est jamais rendu.
  if (isExpired(proposal) && !proposal.response) {
    return <ExpiredLink theme={proposal.theme} />;
  }

  const hideLocations = HIDDEN_LOCATION_TYPES.includes(proposal.type);

  const publicProposal: PublicProposal = {
    slug: proposal.slug,
    recipientName: proposal.recipient_name,
    type: proposal.type,
    message: proposal.message,
    photoUrl: proposal.photo_url,
    theme: proposal.theme,
    locations: hideLocations
      ? []
      : proposal.locations.map((location) => ({
          id: location.id,
          label: location.label,
          address: location.address,
          mapUrl: mapsUrl(location),
        })),
    slots: proposal.slots.map((slot) => ({
      id: slot.id,
      start: slot.start_time,
      end: slot.end_time,
    })),
    hideLocations,
  };

  // Si la réponse existe déjà, on affiche directement le récapitulatif :
  // le lien reste consultable par le destinataire après coup.
  let initialResponse: ConfirmedResponse | null = null;

  if (proposal.response) {
    const slot = proposal.slots.find((item) => item.id === proposal.response?.chosen_slot_id);
    const location = proposal.locations.find(
      (item) => item.id === proposal.response?.chosen_location_id,
    );

    if (slot) {
      initialResponse = {
        countered: false,
        slot: { start: slot.start_time, end: slot.end_time },
        location: location
          ? { label: location.label, address: location.address, mapUrl: mapsUrl(location) }
          : null,
        note: proposal.response.recipient_note,
        icsUrl: `/api/d/${proposal.slug}/ics`,
        googleCalendarUrl: googleCalendarUrl({
          type: proposal.type,
          recipientName: proposal.recipient_name,
          start: new Date(slot.start_time),
          end: new Date(slot.end_time),
          locationLabel: location?.label ?? null,
          locationAddress: location?.address ?? null,
          note: proposal.response.recipient_note,
          url: proposalUrl(publicEnv.siteUrl, proposal.slug),
        }),
      };
    }
  }

  return <RecipientExperience proposal={publicProposal} initialResponse={initialResponse} />;
}
