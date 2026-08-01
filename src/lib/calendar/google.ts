import { PROPOSAL_TYPE_META, type ProposalType } from '@/lib/domain/proposal';

export type GoogleCalendarInput = {
  type: ProposalType;
  recipientName: string;
  start: Date;
  end: Date;
  locationLabel?: string | null;
  locationAddress?: string | null;
  note?: string | null;
  url?: string;
};

/** Format attendu par Google Calendar : YYYYMMDDTHHMMSSZ */
function formatGoogleDate(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

/**
 * Lien « Ajouter à Google Calendar » pré-rempli.
 * Aucune intégration OAuth : c'est une simple URL de composition.
 */
export function googleCalendarUrl(input: GoogleCalendarInput): string {
  const details: string[] = [];
  if (input.note) details.push(`Un mot : « ${input.note} »`);
  if (input.url) details.push(input.url);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${PROPOSAL_TYPE_META[input.type].calendarSummary} avec ${input.recipientName}`,
    dates: `${formatGoogleDate(input.start)}/${formatGoogleDate(input.end)}`,
  });

  const location = [input.locationLabel, input.locationAddress].filter(Boolean).join(' — ');
  if (location) params.set('location', location);
  if (details.length > 0) params.set('details', details.join('\n\n'));

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
