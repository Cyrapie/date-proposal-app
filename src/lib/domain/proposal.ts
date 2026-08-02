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

/**
 * Invitations de groupe.
 *
 * Distinctes des occasions individuelles : quand `audience` vaut `'group'`,
 * `type` prend ses valeurs ici plutôt que dans `PROPOSAL_TYPES`. Réservé à la
 * formule Premium Gold — voir `canCreateGroupInvitations` dans
 * `lib/domain/pricing.ts`.
 */
export const PROPOSAL_AUDIENCES = ['individual', 'group'] as const;
export type ProposalAudience = (typeof PROPOSAL_AUDIENCES)[number];

export const GROUP_TYPES = [
  'friends',
  'club',
  'colleagues',
  'events',
  'chill',
  'afterwork',
] as const;

export type GroupType = (typeof GROUP_TYPES)[number];

/** Le champ `type` en base accepte l'un ou l'autre selon `audience`. */
export type AnyProposalType = ProposalType | GroupType;

export const GROUP_TYPE_META: Record<GroupType, TypeMeta> = {
  friends: {
    label: 'Entre amis',
    headline: 'Une sortie entre amis',
    emoji: '🎉',
    calendarSummary: 'Entre amis',
  },
  club: {
    label: 'Club',
    headline: 'Une sortie de club',
    emoji: '🏆',
    calendarSummary: 'Club',
  },
  colleagues: {
    label: 'Collègues',
    headline: 'Un moment entre collègues',
    emoji: '💼',
    calendarSummary: 'Collègues',
  },
  events: {
    label: 'Événement',
    headline: 'Un événement à ne pas manquer',
    emoji: '🎪',
    calendarSummary: 'Événement',
  },
  chill: {
    label: 'Chill',
    headline: 'Un moment tranquille',
    emoji: '🛋️',
    calendarSummary: 'Chill',
  },
  afterwork: {
    label: 'Afterwork',
    headline: 'Un afterwork',
    emoji: '🍹',
    calendarSummary: 'Afterwork',
  },
};

export function isGroupType(value: string): value is GroupType {
  return (GROUP_TYPES as readonly string[]).includes(value);
}

/** Métadonnées d'un type, individuel ou de groupe — utile partout où l'audience n'est pas déjà connue. */
export function anyTypeMeta(type: AnyProposalType): TypeMeta {
  return isGroupType(type) ? GROUP_TYPE_META[type] : PROPOSAL_TYPE_META[type];
}

export const MIN_GROUP_CAPACITY = 2;
export const MAX_GROUP_CAPACITY = 50;

/**
 * Une réponse de groupe confirmée occupe une place ; au-delà de la capacité,
 * elle rejoint la liste d'attente et est promue automatiquement si une place
 * confirmée se libère (annulation ou retrait depuis la console).
 */
export const RESPONSE_STATUSES = ['confirmed', 'waitlisted'] as const;
export type ResponseStatus = (typeof RESPONSE_STATUSES)[number];
