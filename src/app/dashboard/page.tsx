import Link from 'next/link';
import { redirect } from 'next/navigation';

import { CopyLinkButton } from '@/components/dashboard/CopyLinkButton';
import { QuotaBadge } from '@/components/dashboard/QuotaBadge';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Heart } from '@/components/ui/Heart';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { PROPOSAL_TYPE_META } from '@/lib/domain/proposal';
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

  // Lu via la session normale (RLS : l'utilisateur ne voit que sa propre
  // ligne) — sert seulement à afficher le lien, pas à protéger /admin.
  const { data: profil } = await supabase
    .from('users')
    .select('is_super_admin')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-14">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-bordeaux-500" />
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
          {profil?.is_super_admin ? (
            <Link
              href="/admin"
              className="rounded-full border border-cream-300 px-4 py-2.5 text-xs font-semibold text-ink-400 transition hover:border-bordeaux-500 hover:text-bordeaux-500"
            >
              Super Admin
            </Link>
          ) : null}
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
            const meta = PROPOSAL_TYPE_META[proposal.type];
            const url = proposalUrl(publicEnv.siteUrl, proposal.slug);
            const expired = isPast(proposal.expires_at);

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
