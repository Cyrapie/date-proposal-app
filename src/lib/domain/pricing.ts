/**
 * Grille tarifaire.
 *
 * Les montants de référence sont en XOF. Le franc CFA est en parité fixe avec
 * l'euro depuis 1999 : 1 EUR = 655,957 XOF. Ce n'est pas un taux de marché,
 * donc la conversion est exacte et n'a pas besoin d'être rafraîchie.
 */
export const XOF_PER_EUR = 655.957;

export type PlanId = 'free' | 'premium' | 'gold';

export type PlanTier = {
  id: PlanId;
  name: string;
  /** Prix mensuel en XOF. `0` pour la formule gratuite. */
  priceXof: number;
  /** Nombre maximum d'invitations créées par mois. */
  maxInvitations: number;
  tagline: string;
  features: string[];
  /** Mise en avant visuelle sur la grille. */
  highlighted?: boolean;
};

export const PLAN_TIERS: PlanTier[] = [
  {
    id: 'free',
    name: 'Gratuit',
    priceXof: 0,
    maxInvitations: 5,
    tagline: 'Pour tester, et pour les grandes occasions seulement.',
    features: [
      "Jusqu'à 5 invitations par mois",
      'Les 7 types d’occasion',
      'Les 3 thèmes visuels',
      'Fichier .ics et lien Google Calendar',
      'Contre-proposition de date',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    priceXof: 2500,
    maxInvitations: 10,
    tagline: 'Pour ceux qui invitent vraiment souvent.',
    features: [
      "Jusqu'à 10 invitations par mois",
      'Tout ce que contient la formule gratuite',
      'Durée de validité jusqu’à 90 jours',
      'Photo en pièce jointe des emails',
      'Réponse au support sous 24 h',
    ],
    highlighted: true,
  },
  {
    id: 'gold',
    name: 'Premium Gold',
    priceXof: 10000,
    maxInvitations: 50,
    tagline: 'Pour un usage intensif ou professionnel.',
    features: [
      "Jusqu'à 50 invitations par mois",
      'Tout ce que contient Premium',
      'Suppression de la mention de bas de page',
      'Statistiques d’ouverture détaillées',
      'Accès anticipé aux nouveautés',
    ],
  },
];

/** Formule par identifiant. Retombe sur la gratuite si l'identifiant est inconnu. */
export function planFor(id: PlanId): PlanTier {
  return PLAN_TIERS.find((tier) => tier.id === id) ?? PLAN_TIERS[0];
}

/** Conversion exacte vers l'euro, arrondie au centime. */
export function xofToEur(amountXof: number): number {
  return Math.round((amountXof / XOF_PER_EUR) * 100) / 100;
}

const FORMAT_XOF = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF',
  maximumFractionDigits: 0,
});

const FORMAT_EUR = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

export function formatXof(amount: number): string {
  return FORMAT_XOF.format(amount);
}

export function formatEur(amount: number): string {
  return FORMAT_EUR.format(amount);
}
