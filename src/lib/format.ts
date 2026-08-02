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
  const startDate = new Date(start);
  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();

  if (sameDay) {
    return `${capitalize(DATE_ONLY.format(startDate))}, ${TIME_ONLY.format(startDate)} – ${TIME_ONLY.format(endDate)}`;
  }

  return `${formatDateTime(startDate)} → ${formatDateTime(endDate)}`;
}
