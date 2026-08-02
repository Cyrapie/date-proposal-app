import Link from 'next/link';

import { GrowthChart } from '@/components/admin/GrowthChart';
import { RankedBars } from '@/components/admin/RankedBars';
import { StatTile } from '@/components/admin/StatTile';
import { getConsoleHealth, listConsoleAudit } from '@/lib/console/data';
import { getAdminStats } from '@/lib/data/admin';
import { PROPOSAL_STATUS_LABEL, PROPOSAL_TYPE_META } from '@/lib/domain/proposal';
import { PLAN_TIERS, formatEur, formatXof, xofToEur } from '@/lib/domain/pricing';
import { formatDateTime } from '@/lib/format';

export const metadata = { title: 'Vue d’ensemble' };

export default async function ConsoleOverviewPage() {
  const [stats, health, audit] = await Promise.all([
    getAdminStats(),
    getConsoleHealth(),
    listConsoleAudit(5),
  ]);

  const tauxReponse =
    stats.viewedCount > 0 ? Math.round((stats.respondedCount / stats.viewedCount) * 100) : 0;

  const revenuXof = PLAN_TIERS.reduce(
    (total, tier) => total + (stats.byPlan[tier.id] ?? 0) * tier.priceXof,
    0,
  );

  const statusItems = Object.entries(stats.byStatus).map(([status, value]) => ({
    label: PROPOSAL_STATUS_LABEL[status as keyof typeof PROPOSAL_STATUS_LABEL] ?? status,
    value,
  }));

  const typeItems = Object.entries(stats.byType).map(([type, value]) => ({
    label: PROPOSAL_TYPE_META[type as keyof typeof PROPOSAL_TYPE_META]?.label ?? type,
    value,
  }));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-black text-ink-900">Vue d’ensemble</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-400">
          « Invitations ouvertes » sert d’approximation du nombre de personnes touchées : une même
          personne peut en ouvrir plusieurs, ce n’est pas un décompte strict.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Créateurs inscrits" value={stats.totalCreators} />
        <StatTile label="Invitations ouvertes" value={stats.viewedCount} />
        <StatTile label="Invitations ce mois-ci" value={stats.proposalsThisMonth} />
        <StatTile
          label="Taux de réponse"
          value={`${tauxReponse}%`}
          hint="Parmi les invitations ouvertes"
        />
      </div>

      {health && (health.usersSuspended > 0 || health.proposalsExpired > 0) ? (
        <div className="mt-5 rounded-[var(--radius-card)] border border-bordeaux-200 bg-bordeaux-50 p-4 text-sm text-bordeaux-700">
          <span className="font-semibold">À surveiller :</span>{' '}
          {[
            health.usersSuspended > 0
              ? `${health.usersSuspended} compte${health.usersSuspended > 1 ? 's' : ''} suspendu${health.usersSuspended > 1 ? 's' : ''}`
              : null,
            health.proposalsExpired > 0
              ? `${health.proposalsExpired} invitation${health.proposalsExpired > 1 ? 's' : ''} expirée${health.proposalsExpired > 1 ? 's' : ''} en attente de purge`
              : null,
          ]
            .filter(Boolean)
            .join(' · ')}
          .{' '}
          <Link href="/console/systeme" className="underline underline-offset-4">
            Voir l’état du système
          </Link>
        </div>
      ) : null}

      <div className="mt-6">
        <GrowthChart data={stats.growthDaily} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <RankedBars title="Par statut" items={statusItems} />
        <RankedBars title="Par occasion" items={typeItems} />

        <div className="bloc p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
            Revenu estimé
          </p>
          <p className="mt-3 font-serif text-3xl font-black text-ink-900">
            {formatXof(revenuXof)}
            <span className="ml-1 font-sans text-sm font-normal text-ink-400">/ mois</span>
          </p>
          <p className="text-xs text-ink-400">soit {formatEur(xofToEur(revenuXof))} par mois</p>

          <ul className="mt-5 space-y-2.5">
            {PLAN_TIERS.map((tier) => (
              <li key={tier.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-600">{tier.name}</span>
                <span className="font-semibold text-ink-900">{stats.byPlan[tier.id] ?? 0}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            Calculé sur les formules déclarées en base. Ne reflète aucun paiement réel tant que
            Stripe n’est pas branché.
          </p>
        </div>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
            Dernières actions
          </h2>
          <Link
            href="/console/journal"
            className="text-xs font-semibold text-bordeaux-600 underline underline-offset-4 hover:text-bordeaux-500"
          >
            Tout le journal
          </Link>
        </div>

        {audit.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-cream-300 p-6 text-center text-sm text-ink-400">
            Aucune action enregistrée pour l’instant.
          </p>
        ) : (
          <ul className="rounded-[var(--radius-card)] border border-cream-300 bg-cream-50 p-4">
            {audit.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200 py-2 text-sm last:border-0"
              >
                <span className="text-ink-600">
                  <span className="font-medium text-ink-900">{entry.action}</span>
                  {entry.targetLabel ? ` · ${entry.targetLabel}` : ''}
                </span>
                <span className="text-xs text-ink-400">{formatDateTime(entry.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
