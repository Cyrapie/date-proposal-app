import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ProposalForm } from '@/components/dashboard/ProposalForm';
import { QuotaBadge } from '@/components/dashboard/QuotaBadge';
import { getQuotaState, getUserPlan } from '@/lib/data/quota';
import { getRequestCountry } from '@/lib/geo/request-country';
import { getCurrentUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Créer une invitation',
  robots: { index: false, follow: false },
};

export default async function NewProposalPage() {
  const user = await getCurrentUser();
  const country = await getRequestCountry();

  if (!user) {
    redirect('/login');
  }

  const plan = await getUserPlan(user.id);
  const quota = await getQuotaState(user.id, plan);

  return (
    <div className="mx-auto w-full max-w-lg px-5 py-10 sm:py-14">
      <Link
        href="/dashboard"
        className="text-xs text-ink-400 underline underline-offset-4 hover:text-ink-600"
      >
        ← Mes invitations
      </Link>

      <h1 className="mt-6 font-serif text-3xl font-black leading-[1.06] text-ink-900 sm:text-4xl">
        Créer une invitation
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-400">
        Vous obtiendrez un lien unique à envoyer. La personne choisira le lieu et le créneau
        parmi vos propositions.
      </p>

      <div className="mt-8">
        <QuotaBadge quota={quota} />
      </div>

      {quota.reached ? (
        <p className="mt-6 rounded-[var(--radius-vitrine)] border border-dashed border-cream-300 p-8 text-center text-sm leading-relaxed text-ink-400">
          Vous reprendrez la création le mois prochain, ou dès que vous changerez de formule.
        </p>
      ) : (
        <div className="mt-6">
          <ProposalForm userId={user.id} country={country} plan={plan} />
        </div>
      )}
    </div>
  );
}
