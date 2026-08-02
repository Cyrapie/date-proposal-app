import { notFound } from 'next/navigation';

import { CancelForm } from '@/components/recipient/CancelForm';
import { getProposalBySlug } from '@/lib/data/proposals';
import { themeStyle } from '@/lib/domain/themes';

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
      <main className="themed flex min-h-dvh items-center justify-center px-5" style={themeStyle(proposal.theme)}>
        <p className="max-w-sm text-center text-sm" style={{ color: 'var(--theme-muted)' }}>
          Lien invalide.
        </p>
      </main>
    );
  }

  return (
    <main className="themed flex min-h-dvh items-center justify-center px-5 py-12" style={themeStyle(proposal.theme)}>
      <div className="w-full max-w-sm text-center">
        <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--theme-muted)' }}>
          {proposal.recipient_name}
        </p>
        <h1 className="mt-3 font-serif text-3xl leading-tight" style={{ color: 'var(--theme-accent)' }}>
          Annuler votre place ?
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--theme-muted)' }}>
          Votre place sera libérée pour la personne suivante sur la liste d&apos;attente, si elle
          existe.
        </p>

        <div className="mt-7">
          <CancelForm slug={slug} responseId={responseId} token={token} />
        </div>
      </div>
    </main>
  );
}
