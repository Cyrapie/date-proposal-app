/**
 * Facturation : préparé, non branché.
 *
 * Les limites et les prix vivent dans `@/lib/domain/pricing`, qui alimente à
 * la fois la page publique et l'application du plafond. Ce module ne contient
 * que ce qui touche à Stripe, pour éviter deux sources de vérité.
 *
 * Pour brancher Stripe :
 *   1. Renseigner `STRIPE_PRICE_IDS` ci-dessous.
 *   2. Ajouter `src/app/api/billing/checkout/route.ts` (création de session).
 *   3. Ajouter `src/app/api/billing/webhook/route.ts` : à la réception de
 *      `checkout.session.completed`, écrire la nouvelle valeur dans
 *      `users.plan`. La contrainte en base accepte déjà 'premium' et 'gold'.
 *
 * Rien d'autre dans le code ne présuppose que le plan vaut 'free'.
 */

import type { PlanId } from '@/lib/domain/pricing';

/** Identifiants de prix Stripe, à renseigner le moment venu. */
export const STRIPE_PRICE_IDS: Record<Exclude<PlanId, 'free'>, string | null> = {
  premium: null,
  gold: null,
};

export const STRIPE_CONFIGURED = Object.values(STRIPE_PRICE_IDS).every(Boolean);
