import Link from 'next/link';
import { redirect } from 'next/navigation';

import { CopyLinkButton } from '@/components/dashboard/CopyLinkButton';
import { QuotaBadge } from '@/components/dashboard/QuotaBadge';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { anyTypeMeta } from '@/lib/domain/proposal';
import { proposalUrl } from '@/lib/domain/slug';
import { getQuotaState, getUserPlan } from '@/lib/data/quota';
import { formatShortDate, isPast } from '@/lib/format';
import { publicEnv } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import type { ProposalRow } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mes invitations',
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[dashboard] Chargement impossible', error);
  }

  const proposals = (data ?? []) as ProposalRow[];
  const quota = await getQuotaState(user.id, await getUserPlan(user.id));

  // Un seul aller-retour pour toutes les invitations de groupe plutôt qu'une
  // requête par carte — RLS filtre déjà sur les propositions du créateur.
  const groupProposalIds = proposals.filter((p) => p.audience === 'group').map((p) => p.id);
  const participantsByProposal = new Map<
    string,
    { participantName: string | null; status: string }[]
  >();

  if (groupProposalIds.length > 0) {
    const { data: groupResponses } = await supabase
      .from('responses')
      .select('proposal_id, participant_name, status')
      .in('proposal_id', groupProposalIds);

    for (const row of groupResponses ?? []) {
      const list = participantsByProposal.get(row.proposal_id) ?? [];
      list.push({ participantName: row.participant_name, status: row.status });
      participantsByProposal.set(row.proposal_id, list);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-14">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-sm">
              ✉️
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-bordeaux-500">
              Mes invitations
            </span>
          </div>
          <h1 className="mt-3 font-serif text-3xl font-black leading-[1.06] text-ink-900 sm:text-4xl">
            Vos <span className="gradient-text">propositions</span>
          </h1>
          <p className="mt-2 text-sm text-ink-400">{user.email}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-full border border-cream-300 px-4 py-2.5 text-xs font-semibold text-ink-400 transition hover:border-bordeaux-500 hover:text-bordeaux-500"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      <div className="mt-8">
        <QuotaBadge quota={quota} />
      </div>

      {quota.reached ? (
        <p className="mt-4 flex w-full items-center justify-center rounded-full border border-dashed border-cream-300 px-6 py-3.5 text-center text-sm text-ink-400">
          Création indisponible jusqu’au {formatShortDate(quota.resetsAt)}
        </p>
      ) : (
        <Link
          href="/dashboard/new"
          className="mt-4 flex w-full items-center justify-center rounded-full bg-accent px-6 py-3.5 text-base font-medium text-accent-ink transition hover:bg-accent-hover active:scale-[0.99]"
        >
          Créer une invitation
        </Link>
      )}

      {proposals.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-vitrine)] border border-dashed border-cream-300 p-10 text-center">
          <p className="font-serif text-xl font-bold text-ink-900">Rien pour l&apos;instant</p>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-400">
            Votre première invitation apparaîtra ici, avec son statut, dès que vous l&apos;aurez
            créée.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {proposals.map((proposal) => {
            const meta = anyTypeMeta(proposal.type);
            const url = proposalUrl(publicEnv.siteUrl, proposal.slug);
            const expired = isPast(proposal.expires_at);
            const isGroup = proposal.audience === 'group';
            const participants = participantsByProposal.get(proposal.id) ?? [];
            const confirmed = participants.filter((p) => p.status === 'confirmed');
            const waitlisted = participants.filter((p) => p.status === 'waitlisted');

            return (
              <li
                key={proposal.id}
                className="bloc p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-serif text-xl leading-tight text-ink-900">
                      <span aria-hidden="true">{meta.emoji}</span> {proposal.recipient_name}
                    </p>
                    <p className="mt-1 text-sm text-ink-400">
                      {meta.label} · créée le {formatShortDate(proposal.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={proposal.status} />
                </div>

                {isGroup ? (
                  <div className="mt-3 rounded-xl bg-cream-200 p-3">
                    <p className="text-xs font-semibold text-ink-600">
                      {confirmed.length} / {proposal.group_capacity} places confirmées
                      {waitlisted.length > 0
                        ? ` · ${waitlisted.length} en liste d'attente`
                        : ''}
                    </p>
                    {participants.length > 0 ? (
                      <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-400">
                        {participants.map((p, i) => (
                          <li key={i}>
                            {p.participantName ?? 'Anonyme'}
                            {p.status === 'waitlisted' ? ' (attente)' : ''}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <CopyLinkButton url={url} />
                  <Link
                    href={`/d/${proposal.slug}`}
                    className="rounded-full border border-cream-300 px-4 py-2 text-xs font-medium text-ink-400 transition hover:border-ink-400 hover:text-ink-600"
                  >
                    Aperçu
                  </Link>
                </div>

                <p className="mt-3 text-xs text-ink-400">
                  {expired ? (
                    <span className="text-bordeaux-600">
                      Lien expiré le {formatShortDate(proposal.expires_at)}
                    </span>
                  ) : (
                    <>Expire le {formatShortDate(proposal.expires_at)}</>
                  )}
                  {proposal.viewed_at ? (
                    <> · vue le {formatShortDate(proposal.viewed_at)}</>
                  ) : null}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-10 text-center text-xs text-ink-400">
        <Link href="/privacy" className="underline underline-offset-4 hover:text-ink-600">
          Politique de confidentialité
        </Link>
      </p>
    </div>
  );
}
