import 'server-only';

import { buildIcs, icsFileName } from '@/lib/calendar/ics';
import { googleCalendarUrl } from '@/lib/calendar/google';
import { recipientConfirmationEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/send';
import { proposalUrl } from '@/lib/domain/slug';
import { publicEnv } from '@/lib/env';
import { createAdminClient } from '@/lib/supabase/admin';
import type { FullProposal } from '@/lib/supabase/database.types';

/**
 * Prévient un participant promu depuis la liste d'attente — appelé après
 * qu'une place confirmée s'est libérée, que ce soit par auto-annulation
 * (`/api/d/[slug]/cancel`) ou par retrait depuis la console. Best-effort :
 * la promotion elle-même a déjà eu lieu en base, un échec d'email ici ne la
 * remet pas en cause.
 */
export async function notifyPromotedParticipant(
  proposal: FullProposal,
  promotedResponseId: string,
  promotedEmail: string,
  promotedName: string,
): Promise<void> {
  try {
    const supabase = createAdminClient();
    const { data: response } = await supabase
      .from('responses')
      .select('*')
      .eq('id', promotedResponseId)
      .maybeSingle();

    if (!response) return;

    const slot = proposal.slots.find((item) => item.id === response.chosen_slot_id);
    if (!slot) return;

    const location = proposal.locations.find((item) => item.id === response.chosen_location_id);

    const start = new Date(slot.start_time);
    const end = new Date(slot.end_time);
    const link = proposalUrl(publicEnv.siteUrl, proposal.slug);

    const calendarInput = {
      type: proposal.type,
      recipientName: promotedName,
      start,
      end,
      locationLabel: location?.label ?? null,
      locationAddress: location?.address ?? null,
      note: response.recipient_note,
      url: link,
    };

    const { count: confirmedCount } = await supabase
      .from('responses')
      .select('id', { count: 'exact', head: true })
      .eq('proposal_id', proposal.id)
      .eq('status', 'confirmed');

    const mail = recipientConfirmationEmail({
      recipientName: proposal.recipient_name,
      type: proposal.type,
      locationLabel: calendarInput.locationLabel,
      locationAddress: calendarInput.locationAddress,
      slotStart: start.toISOString(),
      slotEnd: end.toISOString(),
      note: calendarInput.note,
      googleCalendarUrl: googleCalendarUrl(calendarInput),
      proposalUrl: link,
      group: {
        participantName: promotedName,
        status: 'promoted',
        capacity: proposal.group_capacity ?? 0,
        confirmedCount: confirmedCount ?? 1,
      },
    });

    const ics = buildIcs(calendarInput);
    await sendEmail({
      to: promotedEmail,
      ...mail,
      attachments: [
        {
          filename: icsFileName(promotedName),
          content: Buffer.from(ics, 'utf-8'),
          contentType: 'text/calendar; charset=utf-8; method=REQUEST',
        },
      ],
    });
  } catch (error) {
    console.error('[group-promotion] Notification non envoyée', error);
  }
}
