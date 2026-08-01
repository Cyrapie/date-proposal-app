import { redirect } from 'next/navigation';

import { CreatorsTable } from '@/components/admin/CreatorsTable';
import { GrowthChart } from '@/components/admin/GrowthChart';
import { RankedBars } from '@/components/admin/RankedBars';
import { StatTile } from '@/components/admin/StatTile';
import { getAdminCreators, getAdminStats, getCurrentSuperAdmin } from '@/lib/data/admin';
import { PROPOSAL_STATUS_LABEL, PROPOSAL_TYPE_META } from '@/lib/domain/proposal';
import { PLAN_TIERS, formatEur, formatXof, xofToEur } from '@/lib/domain/pricing';

// Les compteurs doivent refléter l'instant présent, pas une page mise en cache.
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const admin = await getCurrentSuperAdmin();

  // Ne révèle pas l'existence du tableau de bord à qui n'y a pas droit :
  // renvoie simplement vers l'espace normal, sans message d'erreur distinctif.
  if (!admin) {
    redirect('/dashboard');
  }

  const [stats, creators] = await Promise.all([getAdminStats(), getAdminCreators()]);

  const tauxReponse =
    stats.viewedCount > 0 ? Math.round((stats.respondedCount / stats.viewedCount) * 100) : 0;

  const revenuXof = PLAN_TIERS.reduce((total, tier) => {
    const count = stats.byPlan[tier.id] ?? 0;
    return total + count * tier.priceXof;
  }, 0);

  const statusItems = Object.entries(stats.byStatus).map(([status, value]) => ({
    label: PROPOSAL_STATUS_LABEL[status as keyof typeof PROPOSAL_STATUS_LABEL] ?? status,
    value,
  }));

  const typeItems = Object.entries(stats.byType).map(([type, value]) => ({
    label: PROPOSAL_TYPE_META[type as keyof typeof PROPOSAL_TYPE_META]?.label ?? type,
    value,
  }));

  const planItems = PLAN_TIERS.map((tier) => ({
    label: tier.name,
    value: stats.byPlan[tier.id] ?? 0,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-bordeaux-500">
          Vue d’ensemble
        </p>
        <h1 className="mt-3 font-serif text-3xl font-black leading-[1.06] text-ink-900 sm:text-4xl">
          Connecté en tant que <span className="gradient-text">{admin.email}</span>
        </h1>
        <p className="mt-2 text-sm text-ink-400">
          « Personnes utilisant le SaaS » compte les créateurs inscrits et les invitations
          effectivement ouvertes — une même personne peut ouvrir plusieurs invitations, ce n’est
          donc pas un compte de personnes strictement uniques.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Créateurs inscrits" value={stats.totalCreators} />
        <StatTile
          label="Invitations ouvertes"
          value={stats.viewedCount}
          hint="Proxy du nombre de personnes touchées"
        />
        <StatTile label="Invitations ce mois-ci" value={stats.proposalsThisMonth} />
        <StatTile
          label="Taux de réponse"
          value={`${tauxReponse}%`}
          hint="Parmi les invitations ouvertes"
        />
      </div>

      <div className="mt-6">
        <GrowthChart data={stats.growthDaily} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <RankedBars title="Par statut" items={statusItems} />
        <RankedBars title="Par occasion" items={typeItems} />
        <div className="bloc p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
            Formules et revenu estimé
          </p>
          <p className="mt-3 font-serif text-3xl font-black text-ink-900">
            {formatXof(revenuXof)}
            <span className="ml-1 font-sans text-sm font-normal text-ink-400">/ mois</span>
          </p>
          <p className="text-xs text-ink-400">soit {formatEur(xofToEur(revenuXof))} par mois</p>

          <ul className="mt-5 space-y-2.5">
            {planItems.map((item) => (
              <li key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-ink-600">{item.label}</span>
                <span className="font-semibold text-ink-900">{item.value}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            Estimation à partir des formules déclarées en base. Ne reflète pas des paiements
            réels tant que Stripe n’est pas branché.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <CreatorsTable creators={creators} />
      </div>
    </div>
  );
}
