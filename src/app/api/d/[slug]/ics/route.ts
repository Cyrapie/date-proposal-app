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
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const proposal = await getProposalBySlug(slug);

  if (!proposal || proposal.responses.length === 0) {
    return NextResponse.json({ error: 'Aucun rendez-vous confirmé.' }, { status: 404 });
  }

  // Une invitation de groupe porte plusieurs réponses : le paramètre `r`
  // cible celle du participant qui télécharge le fichier. Absent (lien
  // individuel, ou ancien lien), on retombe sur la première — la seule qui
  // existe hors groupe.
  const responseId = new URL(request.url).searchParams.get('r');
  const response = responseId
    ? proposal.responses.find((item) => item.id === responseId)
    : proposal.responses[0];

  if (!response) {
    return NextResponse.json({ error: 'Réponse introuvable.' }, { status: 404 });
  }

  const slot = proposal.slots.find((item) => item.id === response.chosen_slot_id);
  if (!slot) {
    return NextResponse.json({ error: 'Créneau introuvable.' }, { status: 404 });
  }

  const location = proposal.locations.find((item) => item.id === response.chosen_location_id);

  const ics = buildIcs({
    type: proposal.type,
    recipientName: response.participant_name ?? proposal.recipient_name,
    start: new Date(slot.start_time),
    end: new Date(slot.end_time),
    locationLabel: location?.label ?? null,
    locationAddress: location?.address ?? null,
    note: response.recipient_note,
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
