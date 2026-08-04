import { notFound } from 'next/navigation';

import { CancelForm, InvalidLinkNotice } from '@/components/recipient/CancelForm';
import { RecipientLanguageToggle } from '@/components/recipient/RecipientLanguageToggle';
import { RecipientThemeToggle } from '@/components/recipient/RecipientThemeToggle';
import { getProposalBySlug } from '@/lib/data/proposals';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Annuler ma place',
  robots: { index: false, follow: false },
};

/**
 * Page intermédiaire du lien d'annulation envoyé par email — jamais un
 * GET direct sur l'action elle-même, pour ne pas être déclenchée par le
 * pré-chargement automatique des liens que font certains clients email.
 */
export default async function CancelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ r?: string; t?: string }>;
}) {
  const { slug } = await params;
  const { r: responseId, t: token } = await searchParams;

  const proposal = await getProposalBySlug(slug);
  if (!proposal) notFound();

  if (!responseId || !token) {
    return (
      <main className="themed flex min-h-dvh items-center justify-center px-5" data-theme={proposal.theme}>
        <RecipientThemeToggle />
        <RecipientLanguageToggle />
        <InvalidLinkNotice />
      </main>
    );
  }

  return (
    <main className="themed flex min-h-dvh items-center justify-center px-5 py-12" data-theme={proposal.theme}>
      <RecipientThemeToggle />
      <RecipientLanguageToggle />
      <CancelForm
        slug={slug}
        responseId={responseId}
        token={token}
        groupName={proposal.recipient_name}
      />
    </main>
  );
}
