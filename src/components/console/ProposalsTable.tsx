'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';

import {
  deleteProposal,
  expireProposal,
} from '@/app/console/(authed)/invitations/actions';
import type { ConsoleProposal } from '@/lib/console/data';
import { PROPOSAL_STATUS_LABEL, PROPOSAL_TYPE_META } from '@/lib/domain/proposal';
import { formatShortDate, isPast } from '@/lib/format';

const FILTRES = [
  { id: 'all', label: 'Toutes' },
  { id: 'active', label: 'Actives' },
  { id: 'expired', label: 'Expirées' },
  { id: 'responded', label: 'Répondues' },
] as const;

type FiltreId = (typeof FILTRES)[number]['id'];

export function ProposalsTable({ proposals }: { proposals: ConsoleProposal[] }) {
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<FiltreId>('all');
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [aSupprimer, setASupprimer] = useState<ConsoleProposal | null>(null);
  const [confirmation, setConfirmation] = useState('');

  const filtrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return proposals.filter((proposal) => {
      const expiree = isPast(proposal.expiresAt);

      if (filtre === 'active' && expiree) return false;
      if (filtre === 'expired' && !expiree) return false;
      if (filtre === 'responded' && !proposal.hasResponse) return false;

      if (!terme) return true;
      return (
        proposal.creatorEmail.toLowerCase().includes(terme) ||
        proposal.recipientName.toLowerCase().includes(terme) ||
        proposal.slug.toLowerCase().includes(terme)
      );
    });
  }, [proposals, recherche, filtre]);

  function lancer(action: () => Promise<{ ok: boolean; message?: string }>) {
    setErreur(null);
    demarrer(async () => {
      const resultat = await action();
      if (!resultat.ok) setErreur(resultat.message ?? 'Action impossible.');
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {FILTRES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFiltre(item.id)}
              aria-pressed={filtre === item.id}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                filtre === item.id
                  ? 'bg-accent text-accent-ink'
                  : 'border border-cream-300 text-ink-600 hover:border-bordeaux-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder="Créateur, destinataire, identifiant…"
          aria-label="Rechercher une invitation"
          className="w-full max-w-xs rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm text-ink-900 outline-none transition focus:border-bordeaux-500 sm:w-auto"
        />
      </div>

      {erreur ? (
        <p role="alert" className="rounded-xl bg-bordeaux-50 px-4 py-3 text-sm text-bordeaux-700">
          {erreur}
        </p>
      ) : null}

      <p className="text-xs text-ink-400">
        {filtrees.length} invitation{filtrees.length > 1 ? 's' : ''}
      </p>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-cream-300 bg-cream-50">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-cream-300 text-xs uppercase tracking-[0.12em] text-ink-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Invitation</th>
              <th className="px-4 py-3 font-semibold">Créateur</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Expire</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtrees.map((proposal) => {
              const expiree = isPast(proposal.expiresAt);
              const meta = PROPOSAL_TYPE_META[proposal.type as keyof typeof PROPOSAL_TYPE_META];

              return (
                <tr key={proposal.id} className="border-b border-cream-200 last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink-900">
                      {meta?.emoji} {proposal.recipientName}
                    </span>
                    <span className="mt-0.5 block font-mono text-[11px] text-ink-400">
                      {proposal.slug}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-ink-600">{proposal.creatorEmail}</td>

                  <td className="px-4 py-3">
                    <span className="text-ink-600">
                      {PROPOSAL_STATUS_LABEL[
                        proposal.status as keyof typeof PROPOSAL_STATUS_LABEL
                      ] ?? proposal.status}
                    </span>
                    {expiree ? (
                      <span className="ml-2 rounded-full bg-cream-200 px-2 py-0.5 text-[11px] font-semibold text-ink-400">
                        Expirée
                      </span>
                    ) : null}
                  </td>

                  <td className="px-4 py-3 text-ink-600">{formatShortDate(proposal.expiresAt)}</td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/console/invitations/${proposal.id}`}
                        className="rounded-full border border-cream-300 px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-bordeaux-500 hover:text-bordeaux-500"
                      >
                        Détail
                      </Link>
                      <button
                        type="button"
                        disabled={enCours || expiree}
                        onClick={() => lancer(() => expireProposal(proposal.id))}
                        className="rounded-full border border-cream-300 px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-bordeaux-500 hover:text-bordeaux-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Désactiver
                      </button>
                      <button
                        type="button"
                        disabled={enCours}
                        onClick={() => {
                          setASupprimer(proposal);
                          setConfirmation('');
                          setErreur(null);
                        }}
                        className="rounded-full border border-bordeaux-200 px-3 py-1.5 text-xs font-semibold text-bordeaux-600 transition hover:bg-bordeaux-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtrees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-400">
                  Aucune invitation ne correspond.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {aSupprimer ? (
        <div className="rounded-[var(--radius-card)] border border-bordeaux-200 bg-bordeaux-50 p-5">
          <p className="font-serif text-lg font-bold text-bordeaux-700">
            Supprimer l’invitation de {aSupprimer.recipientName} ?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Les lieux, créneaux et la réponse éventuelle partent avec elle. Irréversible. Recopiez
            l’identifiant <code className="rounded bg-cream-200 px-1 font-mono">{aSupprimer.slug}</code>{' '}
            pour confirmer.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={aSupprimer.slug}
              aria-label="Confirmer l’identifiant"
              className="w-full max-w-xs rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 font-mono text-sm text-ink-900 outline-none focus:border-bordeaux-500"
            />
            <button
              type="button"
              disabled={enCours || confirmation.trim() !== aSupprimer.slug}
              onClick={() =>
                lancer(async () => {
                  const resultat = await deleteProposal(aSupprimer.id, confirmation);
                  if (resultat.ok) setASupprimer(null);
                  return resultat;
                })
              }
              className="rounded-full bg-bordeaux-600 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-bordeaux-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Supprimer
            </button>
            <button
              type="button"
              onClick={() => setASupprimer(null)}
              className="rounded-full border border-cream-300 px-5 py-2.5 text-sm font-semibold text-ink-600 transition hover:border-ink-400"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
