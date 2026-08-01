import { NextResponse } from 'next/server';

import { buildIcs, icsFileName } from '@/lib/calendar/ics';
import { getProposalBySlug } from '@/lib/data/proposals';
import { proposalUrl } from '@/lib/domain/slug';
import { publicEnv } from '@/lib/env';

/**
 * Téléchargement du .ics du rendez-vous confirmé.
 * Accessible sans compte : la connaissance du slug fait office d'autorisation,
 * comme pour le reste du parcours destinataire.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const proposal = await getProposalBySlug(slug);

  if (!proposal?.response) {
    return NextResponse.json({ error: 'Aucun rendez-vous confirmé.' }, { status: 404 });
  }

  const slot = proposal.slots.find((item) => item.id === proposal.response?.chosen_slot_id);
  if (!slot) {
    return NextResponse.json({ error: 'Créneau introuvable.' }, { status: 404 });
  }

  const location = proposal.locations.find(
    (item) => item.id === proposal.response?.chosen_location_id,
  );

  const ics = buildIcs({
    type: proposal.type,
    recipientName: proposal.recipient_name,
    start: new Date(slot.start_time),
    end: new Date(slot.end_time),
    locationLabel: location?.label ?? null,
    locationAddress: location?.address ?? null,
    note: proposal.response.recipient_note,
    url: proposalUrl(publicEnv.siteUrl, proposal.slug),
  });

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${icsFileName(proposal.recipient_name)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
