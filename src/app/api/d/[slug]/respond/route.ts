import { NextResponse, type NextRequest } from 'next/server';

import type { ConfirmedResponse } from '@/components/recipient/types';
import { buildIcs, icsFileName } from '@/lib/calendar/ics';
import { googleCalendarUrl } from '@/lib/calendar/google';
import { creatorResponseEmail, recipientConfirmationEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';
import { getProposalBySlug, isExpired } from '@/lib/data/proposals';
import { HIDDEN_LOCATION_TYPES, type ProposalType } from '@/lib/domain/proposal';
import { proposalUrl } from '@/lib/domain/slug';
import { publicEnv } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import type { FullProposal } from '@/lib/supabase/database.types';
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

  const isGroup = proposal.audience === 'group';

  // Contre-proposition : réservée aux invitations individuelles. Sur un
  // groupe, chaque place vient d'un même jeu de créneaux — accepter une
  // contre-proposition individuelle n'aurait pas de sens pour les autres.
  const contreProposition = Boolean(input.proposedStart && input.proposedEnd);
  if (isGroup && contreProposition) {
    return NextResponse.json(
      { error: 'Cette option n’est pas disponible sur une invitation de groupe.' },
      { status: 422 },
    );
  }

  if (!isGroup && proposal.responses.length > 0) {
    return NextResponse.json(
      { error: 'Une réponse a déjà été enregistrée pour cette invitation.' },
      { status: 409 },
    );
  }

  const participantName = input.participantName ? input.participantName.trim() : '';
  if (isGroup && participantName.length === 0) {
    return NextResponse.json(
      { error: 'Indiquez votre prénom pour rejoindre le groupe.' },
      { status: 422 },
    );
  }

  // Le créneau et le lieu doivent appartenir à CETTE proposition : sans ce
  // contrôle, un identifiant d'une autre invitation pourrait être injecté.
  const slot = contreProposition
    ? null
    : (proposal.slots.find((item) => item.id === input.slotId) ?? null);

  if (!contreProposition && !slot) {
    return NextResponse.json({ error: 'Créneau inconnu.' }, { status: 422 });
  }

  const hideLocations = !isGroup && HIDDEN_LOCATION_TYPES.includes(proposal.type as ProposalType);
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

  const { data: rpcResult, error: rpcError } = await supabase.rpc('respond_to_proposal', {
    p_proposal_id: proposal.id,
    p_chosen_location_id: location?.id ?? null,
    p_chosen_slot_id: slot?.id ?? null,
    p_recipient_note: note,
    p_recipient_email: recipientEmail,
    p_proposed_start: contreProposition ? new Date(input.proposedStart!).toISOString() : null,
    p_proposed_end: contreProposition ? new Date(input.proposedEnd!).toISOString() : null,
    p_proposed_location: contreProposition ? proposedLocation : null,
    p_participant_name: isGroup ? participantName : null,
  });

  if (rpcError) {
    if (rpcError.message.includes('already_responded')) {
      return NextResponse.json(
        { error: 'Une réponse a déjà été enregistrée pour cette invitation.' },
        { status: 409 },
      );
    }
    console.error('[respond] Enregistrement impossible', rpcError);
    return NextResponse.json({ error: 'Enregistrement impossible.' }, { status: 500 });
  }

  const result = rpcResult?.[0];
  if (!result) {
    console.error('[respond] Réponse RPC vide');
    return NextResponse.json({ error: 'Enregistrement impossible.' }, { status: 500 });
  }

  const waitlisted = result.response_status === 'waitlisted';

  const start = contreProposition ? new Date(input.proposedStart!) : new Date(slot!.start_time);
  const end = contreProposition ? new Date(input.proposedEnd!) : new Date(slot!.end_time);
  const link = proposalUrl(publicEnv.siteUrl, proposal.slug);

  const calendarInput = {
    type: proposal.type,
    recipientName: isGroup ? participantName : proposal.recipient_name,
    start,
    end,
    locationLabel: contreProposition ? proposedLocation : (location?.label ?? null),
    locationAddress: contreProposition ? null : (location?.address ?? null),
    note,
    url: link,
  };

  const gcalUrl = googleCalendarUrl(calendarInput);

  // Les notifications sont best-effort : la réponse est déjà enregistrée, un
  // échec d'email ne doit pas la faire échouer.
  void sendNotifications({
    proposal,
    calendarInput,
    gcalUrl,
    link,
    recipientEmail,
    countered: contreProposition,
    isGroup,
    participantName,
    responseStatus: result.response_status,
    waitlistPosition: result.response_waitlist_position,
    cancelToken: result.response_cancel_token,
    responseId: result.response_id,
  });

  const response: ConfirmedResponse = {
    countered: contreProposition,
    location: contreProposition
      ? proposedLocation
        ? { label: proposedLocation, address: null }
        : null
      : location
        ? { label: location.label, address: location.address }
        : null,
    slot: { start: start.toISOString(), end: end.toISOString() },
    note,
    icsUrl: `/api/d/${proposal.slug}/ics?r=${result.response_id}`,
    googleCalendarUrl: gcalUrl,
    group: isGroup
      ? {
          status: waitlisted ? 'waitlisted' : 'confirmed',
          capacity: proposal.group_capacity ?? 0,
          waitlistPosition: result.response_waitlist_position ?? undefined,
        }
      : undefined,
  };

  return NextResponse.json({ response }, { status: 201 });
}

type NotificationInput = {
  proposal: FullProposal;
  calendarInput: Parameters<typeof buildIcs>[0];
  gcalUrl: string;
  link: string;
  recipientEmail: string | null;
  countered: boolean;
  isGroup: boolean;
  participantName: string;
  responseStatus: string;
  waitlistPosition: number | null;
  cancelToken: string | null;
  responseId: string;
};

async function sendNotifications(input: NotificationInput) {
  try {
    const supabase = createAdminClient();

    const { data: creator } = await supabase
      .from('users')
      .select('email')
      .eq('id', input.proposal.creator_id)
      .maybeSingle();

    const ics = buildIcs(input.calendarInput);
    const attachment = {
      filename: icsFileName(input.calendarInput.recipientName),
      content: Buffer.from(ics, 'utf-8'),
      contentType: 'text/calendar; charset=utf-8; method=REQUEST',
    };

    let confirmedCount = 1;
    if (input.isGroup) {
      const { count } = await supabase
        .from('responses')
        .select('id', { count: 'exact', head: true })
        .eq('proposal_id', input.proposal.id)
        .eq('status', 'confirmed');
      confirmedCount = count ?? 1;
    }

    const cancelUrl =
      input.isGroup && input.cancelToken
        ? `${input.link}/annuler?r=${input.responseId}&t=${input.cancelToken}`
        : undefined;

    const groupContext = input.isGroup
      ? {
          participantName: input.participantName,
          status: (input.responseStatus === 'waitlisted' ? 'waitlisted' : 'confirmed') as
            | 'confirmed'
            | 'waitlisted',
          capacity: input.proposal.group_capacity ?? 0,
          confirmedCount,
          waitlistPosition: input.waitlistPosition ?? undefined,
          cancelUrl,
        }
      : undefined;

    const emailData = {
      recipientName: input.proposal.recipient_name,
      type: input.proposal.type,
      locationLabel: input.calendarInput.locationLabel ?? null,
      locationAddress: input.calendarInput.locationAddress ?? null,
      slotStart: input.calendarInput.start.toISOString(),
      slotEnd: input.calendarInput.end.toISOString(),
      note: input.calendarInput.note ?? null,
      googleCalendarUrl: input.gcalUrl,
      proposalUrl: input.link,
      group: groupContext,
    };

    if (creator?.email) {
      const mail = creatorResponseEmail({ ...emailData, countered: input.countered });
      // Pas d'ics pour un simple ajout à la liste d'attente : rien n'est
      // encore acquis.
      const attachments = groupContext?.status === 'waitlisted' ? [] : [attachment];
      await sendEmail({ to: creator.email, ...mail, attachments });
    }

    if (input.recipientEmail) {
      const mail = recipientConfirmationEmail({ ...emailData, countered: input.countered });
      const attachments = groupContext?.status === 'waitlisted' ? [] : [attachment];
      await sendEmail({ to: input.recipientEmail, ...mail, attachments });
    }
  } catch (error) {
    console.error('[respond] Notifications non envoyées', error);
  }
}
