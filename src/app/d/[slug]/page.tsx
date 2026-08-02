import { notFound } from 'next/navigation';

import { RecipientExperience } from '@/components/recipient/RecipientExperience';
import type { ConfirmedResponse, PublicProposal } from '@/components/recipient/types';
import { ExpiredLink } from '@/components/recipient/ExpiredLink';
import { googleCalendarUrl } from '@/lib/calendar/google';
import { mapsUrl } from '@/lib/domain/geo';
import { getProposalBySlug, isExpired } from '@/lib/data/proposals';
import { HIDDEN_LOCATION_TYPES, type ProposalType } from '@/lib/domain/proposal';
import { proposalUrl } from '@/lib/domain/slug';
import { publicEnv } from '@/lib/env';

/** Chaque ouverture doit être fraîche : le statut « vue » en dépend. */
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Keerelle',
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
  // Exception : au moins une réponse existe déjà, pour que qui a déjà
  // répondu garde accès à son récapitulatif.
  if (isExpired(proposal) && proposal.responses.length === 0) {
    return <ExpiredLink theme={proposal.theme} />;
  }

  const isGroup = proposal.audience === 'group';
  const hideLocations = !isGroup && HIDDEN_LOCATION_TYPES.includes(proposal.type as ProposalType);

  const publicProposal: PublicProposal = {
    slug: proposal.slug,
    recipientName: proposal.recipient_name,
    type: proposal.type,
    audience: proposal.audience,
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
    group: isGroup
      ? {
          capacity: proposal.group_capacity ?? 0,
          confirmedCount: proposal.responses.filter((r) => r.status === 'confirmed').length,
          waitlistedCount: proposal.responses.filter((r) => r.status === 'waitlisted').length,
        }
      : undefined,
  };

  // Si la réponse existe déjà, on affiche directement le récapitulatif : le
  // lien reste consultable par le destinataire après coup. Impossible à
  // déterminer pour un groupe — plusieurs personnes différentes partagent le
  // même lien, la page ne sait pas laquelle l'ouvre.
  let initialResponse: ConfirmedResponse | null = null;
  const existingResponse = proposal.responses[0];

  if (!isGroup && existingResponse) {
    const slot = proposal.slots.find((item) => item.id === existingResponse.chosen_slot_id);
    const location = proposal.locations.find(
      (item) => item.id === existingResponse.chosen_location_id,
    );

    if (slot) {
      initialResponse = {
        countered: false,
        slot: { start: slot.start_time, end: slot.end_time },
        location: location
          ? { label: location.label, address: location.address, mapUrl: mapsUrl(location) }
          : null,
        note: existingResponse.recipient_note,
        icsUrl: `/api/d/${proposal.slug}/ics?r=${existingResponse.id}`,
        googleCalendarUrl: googleCalendarUrl({
          type: proposal.type,
          recipientName: proposal.recipient_name,
          start: new Date(slot.start_time),
          end: new Date(slot.end_time),
          locationLabel: location?.label ?? null,
          locationAddress: location?.address ?? null,
          note: existingResponse.recipient_note,
          url: proposalUrl(publicEnv.siteUrl, proposal.slug),
        }),
      };
    }
  }

  return <RecipientExperience proposal={publicProposal} initialResponse={initialResponse} />;
}
