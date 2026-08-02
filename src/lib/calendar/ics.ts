import 'server-only';

import { createEvent, type DateArray, type EventAttributes } from 'ics';

import { anyTypeMeta, type AnyProposalType } from '@/lib/domain/proposal';

export type CalendarEventInput = {
  type: AnyProposalType;
  recipientName: string;
  start: Date;
  end: Date;
  locationLabel?: string | null;
  locationAddress?: string | null;
  note?: string | null;
  /** URL de la proposition, ajoutée en description pour retrouver le contexte. */
  url?: string;
};

/** `ics` attend des composantes de date ; on les fournit en UTC. */
function toUtcDateArray(date: Date): DateArray {
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
  ];
}

function buildDescription(input: CalendarEventInput): string {
  const lines: string[] = [];

  if (input.locationLabel) {
    lines.push(`Lieu : ${input.locationLabel}`);
  }
  if (input.locationAddress) {
    lines.push(`Adresse : ${input.locationAddress}`);
  }
  if (input.note) {
    lines.push('', `Un mot : « ${input.note} »`);
  }
  if (input.url) {
    lines.push('', input.url);
  }

  return lines.join('\n');
}

export function buildEventTitle(input: CalendarEventInput): string {
  return `${anyTypeMeta(input.type).calendarSummary} avec ${input.recipientName}`;
}

/** Génère le contenu d'un fichier .ics. Lève si la génération échoue. */
export function buildIcs(input: CalendarEventInput): string {
  const location = [input.locationLabel, input.locationAddress]
    .filter(Boolean)
    .join(' — ');

  const attributes: EventAttributes = {
    start: toUtcDateArray(input.start),
    startInputType: 'utc',
    startOutputType: 'utc',
    end: toUtcDateArray(input.end),
    endInputType: 'utc',
    endOutputType: 'utc',
    title: buildEventTitle(input),
    description: buildDescription(input),
    location: location || undefined,
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    productId: 'date-proposal-app',
  };

  const { error, value } = createEvent(attributes);

  if (error || !value) {
    throw error ?? new Error('Génération du fichier .ics impossible.');
  }

  return value;
}

export function icsFileName(recipientName: string): string {
  const safe = recipientName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return `rendez-vous${safe ? `-${safe}` : ''}.ics`;
}
