/**
 * Source de vérité des libellés métier : types d'occasion, thèmes, statuts.
 * Les valeurs doivent rester alignées avec les contraintes CHECK des migrations.
 */

export const PROPOSAL_TYPES = [
  'cinema',
  'restaurant',
  'weekend',
  'activity',
  'surprise',
  'birthday',
  'just_because',
] as const;

export type ProposalType = (typeof PROPOSAL_TYPES)[number];

type TypeMeta = {
  /** Libellé court utilisé dans les formulaires. */
  label: string;
  /** Titre affiché au destinataire sur la lettre. */
  headline: string;
  emoji: string;
  /** Résumé utilisé comme titre d'événement calendrier. */
  calendarSummary: string;
};

export const PROPOSAL_TYPE_META: Record<ProposalType, TypeMeta> = {
  cinema: {
    label: 'Cinéma',
    headline: 'Une séance de cinéma',
    emoji: '🎬',
    calendarSummary: 'Cinéma',
  },
  restaurant: {
    label: 'Restaurant',
    headline: 'Un dîner en tête-à-tête',
    emoji: '🍷',
    calendarSummary: 'Restaurant',
  },
  weekend: {
    label: 'Weekend ou voyage',
    headline: 'Une escapade à deux',
    emoji: '🧳',
    calendarSummary: 'Weekend',
  },
  activity: {
    label: 'Activité',
    headline: 'Une activité ensemble',
    emoji: '🎯',
    calendarSummary: 'Activité',
  },
  surprise: {
    label: 'Surprise (lieu caché)',
    headline: 'Une surprise',
    emoji: '🎁',
    calendarSummary: 'Surprise',
  },
  birthday: {
    label: 'Anniversaire',
    headline: 'Un anniversaire à fêter',
    emoji: '🎂',
    calendarSummary: 'Anniversaire',
  },
  just_because: {
    label: 'Juste comme ça',
    headline: 'Juste comme ça',
    emoji: '💌',
    calendarSummary: 'Rendez-vous',
  },
};

export function isProposalType(value: string): value is ProposalType {
  return (PROPOSAL_TYPES as readonly string[]).includes(value);
}

/** Le lieu reste masqué au destinataire tant qu'il n'a pas accepté. */
export const HIDDEN_LOCATION_TYPES: ProposalType[] = ['surprise'];

export const PROPOSAL_STATUSES = ['created', 'viewed', 'responded', 'countered'] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  created: 'Créée',
  viewed: 'Vue',
  responded: 'Répondue',
  countered: 'Autre date proposée',
};

export const MAX_LOCATIONS = 3;
export const MAX_SLOTS = 5;

/** Durées de conservation proposées à la création (RGPD : lien expirant). */
export const EXPIRY_OPTIONS = [7, 14, 30, 60, 90] as const;
