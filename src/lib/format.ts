/** Formatage FR partagé entre l'UI et les emails. */

const DATE_TIME = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

const DATE_ONLY = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const TIME_ONLY = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

const SHORT_DATE = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** `true` si la date est déjà passée. Isolé ici pour rester hors du rendu. */
export function isPast(value: string | Date): boolean {
  return new Date(value).getTime() < Date.now();
}

export function formatDateTime(value: string | Date): string {
  return capitalize(DATE_TIME.format(new Date(value)));
}

export function formatShortDate(value: string | Date): string {
  return SHORT_DATE.format(new Date(value));
}

const SHORT_DATE_EN = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/** Date courte du site vitrine, qui suit la langue choisie par le visiteur. */
export function formatShortDateIn(value: string | Date, lang: 'fr' | 'en'): string {
  const date = new Date(value);
  return lang === 'en' ? SHORT_DATE_EN.format(date) : SHORT_DATE.format(date);
}

/** « Samedi 8 août, 20:00 – 22:30 » */
export function formatSlotRange(start: string | Date, end: string | Date): string {
  return formatSlotRangeIn(start, end, 'fr');
}

const EN_DATE_TIME = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

const EN_DATE_ONLY = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const EN_TIME_ONLY = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/**
 * Créneau formaté dans la langue du visiteur.
 *
 * Le parcours destinataire l'utilise : un créneau est la donnée la plus lue de
 * l'invitation, la laisser en français dans une page anglaise serait le
 * détail qui trahit la traduction. Les emails et le fichier .ics gardent
 * `formatSlotRange`, rendus côté serveur qui ne connaît pas la préférence.
 */
export function formatSlotRangeIn(
  start: string | Date,
  end: string | Date,
  lang: 'fr' | 'en',
): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();

  const dateOnly = lang === 'en' ? EN_DATE_ONLY : DATE_ONLY;
  const timeOnly = lang === 'en' ? EN_TIME_ONLY : TIME_ONLY;
  const dateTime = lang === 'en' ? EN_DATE_TIME : DATE_TIME;

  if (sameDay) {
    return `${capitalize(dateOnly.format(startDate))}, ${timeOnly.format(startDate)} – ${timeOnly.format(endDate)}`;
  }

  return `${capitalize(dateTime.format(startDate))} → ${capitalize(dateTime.format(endDate))}`;
}
