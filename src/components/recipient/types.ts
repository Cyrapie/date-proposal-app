import type { AnyProposalType, ProposalAudience } from '@/lib/domain/proposal';
import type { Theme } from '@/lib/domain/themes';

/**
 * Vue publique d'une proposition : ce que le serveur consent à exposer au
 * destinataire. Ni `creator_id`, ni identifiants internes superflus.
 */
export type PublicProposal = {
  slug: string;
  recipientName: string;
  type: AnyProposalType;
  audience: ProposalAudience;
  message: string | null;
  photoUrl: string | null;
  theme: Theme;
  locations: {
    id: string;
    label: string;
    address: string | null;
    /** Lien Google Maps, calculé côté serveur depuis les coordonnées ou l'adresse. */
    mapUrl: string | null;
  }[];
  slots: { id: string; start: string; end: string }[];
  /** Le lieu est masqué jusqu'à l'acceptation (occasion « surprise »). */
  hideLocations: boolean;
  /** Présent uniquement pour une invitation de groupe. */
  group?: {
    capacity: number;
    confirmedCount: number;
    waitlistedCount: number;
  };
};

export type ConfirmedResponse = {
  /** Le destinataire a proposé sa propre date. */
  countered: boolean;
  location: { label: string; address: string | null; mapUrl?: string | null } | null;
  slot: { start: string; end: string };
  note: string | null;
  googleCalendarUrl: string;
  icsUrl: string;
  /** Présent uniquement pour une invitation de groupe. */
  group?: {
    status: 'confirmed' | 'waitlisted';
    capacity: number;
    waitlistPosition?: number;
  };
};
