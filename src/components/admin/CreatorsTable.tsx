'use client';

import { useState } from 'react';

import { PLAN_TIERS } from '@/lib/domain/pricing';
import { formatShortDate } from '@/lib/format';
import type { AdminCreator } from '@/lib/data/admin';

/**
 * Liste des créateurs, avec changement de formule manuel.
 *
 * C'est l'action « administrer » concrète tant que Stripe n'est pas branché :
 * un paiement confirmé hors-ligne (mobile money, virement) se traduit ici par
 * un changement de menu déroulant.
 */
export function CreatorsTable({ creators }: { creators: AdminCreator[] }) {
  const [lignes, setLignes] = useState(creators);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function changerFormule(id: string, plan: string) {
    setEnCours(id);
    setErreur(null);

    const precedent = lignes;
    // Optimiste : on affiche le changement tout de suite, on annule si le
    // serveur refuse.
    setLignes((c) => c.map((ligne) => (ligne.id === id ? { ...ligne, plan: plan as never } : ligne)));

    try {
      const res = await fetch(`/api/admin/creators/${id}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? 'Changement refusé.');
      }
    } catch (caught) {
      setLignes(precedent);
      setErreur(caught instanceof Error ? caught.message : 'Changement refusé.');
    } finally {
      setEnCours(null);
    }
  }

  return (
    <div className="bloc overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 p-6 pb-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
          Créateurs ({lignes.length})
        </p>
        {erreur ? <p className="text-xs font-medium text-bordeaux-600">{erreur}</p> : null}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-cream-300 text-xs text-ink-400">
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-3 py-3 font-semibold">Inscrit le</th>
              <th className="px-3 py-3 font-semibold">Invitations</th>
              <th className="px-3 py-3 font-semibold">Réponses</th>
              <th className="px-3 py-3 font-semibold">Formule</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((creator) => (
              <tr key={creator.id} className="border-b border-cream-200 last:border-0">
                <td className="px-6 py-3">
                  <span className="text-ink-900">{creator.email}</span>
                  {creator.isSuperAdmin ? (
                    <span className="ml-2 rounded-full bg-bordeaux-50 px-2 py-0.5 text-[10px] font-semibold text-bordeaux-600">
                      Super admin
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3 text-ink-600">{formatShortDate(creator.createdAt)}</td>
                <td className="px-3 py-3 text-ink-600">{creator.proposalsCount}</td>
                <td className="px-3 py-3 text-ink-600">{creator.responsesCount}</td>
                <td className="px-3 py-3">
                  <select
                    value={creator.plan}
                    disabled={enCours === creator.id}
                    onChange={(event) => changerFormule(creator.id, event.target.value)}
                    className="rounded-lg border border-cream-300 bg-cream-50 px-2.5 py-1.5 text-xs text-ink-900 outline-none focus:border-bordeaux-500 disabled:opacity-50"
                  >
                    {PLAN_TIERS.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
