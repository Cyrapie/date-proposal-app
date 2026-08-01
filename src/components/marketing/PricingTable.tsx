import Link from 'next/link';

import {
  PLAN_TIERS,
  formatEur,
  formatXof,
  xofToEur,
  type PlanTier,
} from '@/lib/domain/pricing';
import type { CurrencyPreference } from '@/lib/domain/countries';
import { CTA } from '@/lib/marketing/nav';

function Prix({ tier, devise }: { tier: PlanTier; devise: CurrencyPreference }) {
  if (tier.priceXof === 0) {
    return (
      <p className="font-serif text-4xl font-black text-ink-900">
        Gratuit
        <span className="ml-1 font-sans text-sm font-normal text-ink-400">pour toujours</span>
      </p>
    );
  }

  const principal = devise === 'XOF' ? formatXof(tier.priceXof) : formatEur(xofToEur(tier.priceXof));
  const secondaire = devise === 'XOF' ? formatEur(xofToEur(tier.priceXof)) : formatXof(tier.priceXof);

  return (
    <div>
      <p className="font-serif text-4xl font-black text-ink-900">
        {principal}
        <span className="ml-1 font-sans text-sm font-normal text-ink-400">/ mois</span>
      </p>
      <p className="mt-1 text-xs text-ink-400">soit {secondaire} par mois</p>
    </div>
  );
}

/**
 * Grille tarifaire. La devise mise en avant suit le pays du visiteur, mais
 * les deux montants sont toujours affichés : la parité XOF/EUR est fixe,
 * aucune conversion approximative n'est en jeu.
 */
export function PricingTable({ devise }: { devise: CurrencyPreference }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 lg:grid-cols-3">
      {PLAN_TIERS.map((tier) => (
        <article
          key={tier.id}
          className={`bloc relative flex flex-col p-8 ${
            tier.highlighted ? 'ring-2 ring-bordeaux-500' : ''
          }`}
        >
          {tier.highlighted ? (
            <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-ink">
              Le plus choisi
            </span>
          ) : null}

          <h3 className="font-serif text-2xl font-extrabold text-ink-900">{tier.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-400">{tier.tagline}</p>

          <div className="mt-6">
            <Prix tier={tier} devise={devise} />
          </div>

          <p className="mt-6 rounded-xl bg-bordeaux-50 px-4 py-3 text-sm font-semibold text-bordeaux-600">
            {tier.maxInvitations} invitations par mois
          </p>

          <ul className="mt-6 flex-1 space-y-3">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-600">
                <svg
                  viewBox="0 0 20 20"
                  className="mt-0.5 h-4 w-4 shrink-0 text-bordeaux-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href={CTA.href}
            className={`mt-8 block rounded-full px-6 py-3.5 text-center text-base font-semibold transition hover:-translate-y-0.5 ${
              tier.highlighted
                ? 'bg-accent text-accent-ink hover:bg-accent-hover'
                : 'border border-cream-300 text-bordeaux-600 hover:border-bordeaux-500 hover:bg-bordeaux-50'
            }`}
          >
            {tier.priceXof === 0 ? 'Commencer gratuitement' : 'Choisir ' + tier.name}
          </Link>
        </article>
      ))}
    </div>
  );
}
