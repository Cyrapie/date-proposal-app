import { redirect } from 'next/navigation';

import {
  NewProposalHeader,
  QuotaReachedNotice,
} from '@/components/dashboard/NewProposalIntro';
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
      <NewProposalHeader />

      <div className="mt-8">
        <QuotaBadge quota={quota} />
      </div>

      {quota.reached ? (
        <QuotaReachedNotice />
      ) : (
        <div className="mt-6">
          <ProposalForm userId={user.id} country={country} plan={plan} />
        </div>
      )}
    </div>
  );
}
