import { NextResponse, type NextRequest } from 'next/server';

import type { ConfirmedResponse } from '@/components/recipient/types';
import { buildIcs, icsFileName } from '@/lib/calendar/ics';
import { googleCalendarUrl } from '@/lib/calendar/google';
import { creatorResponseEmail, recipientConfirmationEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';
import { getProposalBySlug, isExpired } from '@/lib/data/proposals';
import { HIDDEN_LOCATION_TYPES } from '@/lib/domain/proposal';
import { proposalUrl } from '@/lib/domain/slug';
import { publicEnv } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import { respondSchema } from '@/lib/validation/proposal';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête illisible.' }, { status: 400 });
  }

  const parsed = respondSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Choix invalide.' },
      { status: 422 },
    );
  }

  const input = parsed.data;
  const proposal = await getProposalBySlug(slug);

  if (!proposal) {
    return NextResponse.json({ error: 'Invitation introuvable.' }, { status: 404 });
  }

  if (isExpired(proposal)) {
    return NextResponse.json({ error: 'Ce lien a expiré.' }, { status: 410 });
  }

  if (proposal.response) {
    return NextResponse.json(
      { error: 'Une réponse a déjà été enregistrée pour cette invitation.' },
      { status: 409 },
    );
  }

  // Contre-proposition : le destinataire n'a retenu aucun créneau offert.
  const contreProposition = Boolean(input.proposedStart && input.proposedEnd);

  // Le créneau et le lieu doivent appartenir à CETTE proposition : sans ce
  // contrôle, un identifiant d'une autre invitation pourrait être injecté.
  const slot = contreProposition
    ? null
    : (proposal.slots.find((item) => item.id === input.slotId) ?? null);

  if (!contreProposition && !slot) {
    return NextResponse.json({ error: 'Créneau inconnu.' }, { status: 422 });
  }

  const hideLocations = HIDDEN_LOCATION_TYPES.includes(proposal.type);
  let location = null;

  if (input.locationId && !hideLocations) {
    location = proposal.locations.find((item) => item.id === input.locationId) ?? null;
    if (!location) {
      return NextResponse.json({ error: 'Lieu inconnu.' }, { status: 422 });
    }
  }

  const note = input.note ? input.note : null;
  const recipientEmail = input.email ? input.email : null;
  const proposedLocation = input.proposedLocation ? input.proposedLocation : null;

  const supabase = createAdminClient();

  const { error: insertError } = await supabase.from('responses').insert({
    proposal_id: proposal.id,
    chosen_location_id: location?.id ?? null,
    chosen_slot_id: slot?.id ?? null,
    recipient_note: note,
    recipient_email: recipientEmail,
    proposed_start: contreProposition ? new Date(input.proposedStart!).toISOString() : null,
    proposed_end: contreProposition ? new Date(input.proposedEnd!).toISOString() : null,
    proposed_location: contreProposition ? proposedLocation : null,
  });

  if (insertError) {
    // 23505 : une réponse est arrivée entre-temps (double soumission).
    if (insertError.code === '23505') {
      return NextResponse.json(
        { error: 'Une réponse a déjà été enregistrée pour cette invitation.' },
        { status: 409 },
      );
    }
    console.error('[respond] Enregistrement impossible', insertError);
    return NextResponse.json({ error: 'Enregistrement impossible.' }, { status: 500 });
  }

  // Une contre-proposition n'est pas une acceptation : le créateur doit
  // encore trancher, d'où un statut distinct dans son tableau de bord.
  const { error: statusError } = await supabase
    .from('proposals')
    .update({ status: contreProposition ? 'countered' : 'responded' })
    .eq('id', proposal.id);

  if (statusError) {
    console.error('[respond] Mise à jour du statut impossible', statusError);
  }

  const start = contreProposition ? new Date(input.proposedStart!) : new Date(slot!.start_time);
  const end = contreProposition ? new Date(input.proposedEnd!) : new Date(slot!.end_time);
  const link = proposalUrl(publicEnv.siteUrl, proposal.slug);

  const calendarInput = {
    type: proposal.type,
    recipientName: proposal.recipient_name,
    start,
    end,
    locationLabel: contreProposition ? proposedLocation : (location?.label ?? null),
    locationAddress: contreProposition ? null : (location?.address ?? null),
    note,
    url: link,
  };

  const gcalUrl = googleCalendarUrl(calendarInput);

  // Les notifications sont best-effort : la réponse du destinataire est déjà
  // enregistrée, un échec d'email ne doit pas la faire échouer.
  void sendNotifications({
    proposalId: proposal.id,
    creatorId: proposal.creator_id,
    calendarInput,
    gcalUrl,
    link,
    recipientEmail,
    countered: contreProposition,
  });

  const response: ConfirmedResponse = {
    slot: { start: start.toISOString(), end: end.toISOString() },
    location: contreProposition
      ? proposedLocation
        ? { label: proposedLocation, address: null }
        : null
      : location
        ? { label: location.label, address: location.address }
        : null,
    note,
    countered: contreProposition,
    icsUrl: `/api/d/${proposal.slug}/ics`,
    googleCalendarUrl: gcalUrl,
  };

  return NextResponse.json({ response }, { status: 201 });
}

type NotificationInput = {
  proposalId: string;
  creatorId: string;
  calendarInput: Parameters<typeof buildIcs>[0];
  gcalUrl: string;
  link: string;
  recipientEmail: string | null;
  /** Le destinataire a proposé sa propre date au lieu d'en choisir une. */
  countered: boolean;
};

async function sendNotifications(input: NotificationInput) {
  try {
    const supabase = createAdminClient();

    const { data: creator } = await supabase
      .from('users')
      .select('email')
      .eq('id', input.creatorId)
      .maybeSingle();

    const ics = buildIcs(input.calendarInput);
    const attachment = {
      filename: icsFileName(input.calendarInput.recipientName),
      content: Buffer.from(ics, 'utf-8'),
      contentType: 'text/calendar; charset=utf-8; method=REQUEST',
    };

    const emailData = {
      recipientName: input.calendarInput.recipientName,
      type: input.calendarInput.type,
      locationLabel: input.calendarInput.locationLabel ?? null,
      locationAddress: input.calendarInput.locationAddress ?? null,
      slotStart: input.calendarInput.start.toISOString(),
      slotEnd: input.calendarInput.end.toISOString(),
      note: input.calendarInput.note ?? null,
      googleCalendarUrl: input.gcalUrl,
      proposalUrl: input.link,
    };

    if (creator?.email) {
      const mail = creatorResponseEmail({ ...emailData, countered: input.countered });
      await sendEmail({ to: creator.email, ...mail, attachments: [attachment] });
    }

    if (input.recipientEmail) {
      const mail = recipientConfirmationEmail({ ...emailData, countered: input.countered });
      await sendEmail({ to: input.recipientEmail, ...mail, attachments: [attachment] });
    }
  } catch (error) {
    console.error('[respond] Notifications non envoyées', error);
  }
}
