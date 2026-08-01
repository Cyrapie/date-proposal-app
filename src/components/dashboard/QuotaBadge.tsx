import Link from 'next/link';

import type { QuotaState } from '@/lib/data/quota';
import { formatShortDate } from '@/lib/format';

/** Compteur d'invitations du mois, affiché au créateur. */
export function QuotaBadge({ quota }: { quota: QuotaState }) {
  const pourcentage = Math.min(100, (quota.used / quota.plan.maxInvitations) * 100);

  return (
    <div
      className={`rounded-[var(--radius-vitrine)] border p-5 ${
        quota.reached ? 'border-bordeaux-500 bg-bordeaux-50' : 'border-cream-300 bg-cream-50'
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-ink-900">
          {quota.used} / {quota.plan.maxInvitations} invitations ce mois-ci
        </p>
        <p className="text-xs text-ink-400">
          Formule {quota.plan.name} · remise à zéro le {formatShortDate(quota.resetsAt)}
        </p>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cream-300"
        role="progressbar"
        aria-valuenow={quota.used}
        aria-valuemin={0}
        aria-valuemax={quota.plan.maxInvitations}
        aria-label="Invitations créées ce mois-ci"
      >
        <div
          className={`h-full rounded-full transition-all ${
            quota.reached ? 'bg-bordeaux-500' : 'bg-accent'
          }`}
          style={{ width: `${pourcentage}%` }}
        />
      </div>

      {quota.reached ? (
        <p className="mt-3 text-sm leading-relaxed text-bordeaux-700">
          Limite atteinte. Vos invitations déjà envoyées continuent de fonctionner normalement.{' '}
          <Link href="/tarifs" className="font-semibold underline underline-offset-4">
            Voir les formules
          </Link>
        </p>
      ) : quota.remaining <= 2 ? (
        <p className="mt-3 text-xs leading-relaxed text-ink-400">
          Plus que {quota.remaining} {quota.remaining > 1 ? 'invitations' : 'invitation'} avant la
          fin du mois.{' '}
          <Link href="/tarifs" className="underline underline-offset-4 hover:text-bordeaux-500">
            Voir les formules
          </Link>
        </p>
      ) : null}
    </div>
  );
}
