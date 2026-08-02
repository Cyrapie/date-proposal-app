'use client';

import { useMemo, useState, useTransition } from 'react';

import {
  deleteUser,
  setUserPlan,
  setUserSuspended,
} from '@/app/console/(authed)/utilisateurs/actions';
import type { ConsoleUser } from '@/lib/console/data';
import { formatShortDate } from '@/lib/format';

const PLANS = [
  { id: 'free', label: 'Gratuit' },
  { id: 'premium', label: 'Premium' },
  { id: 'gold', label: 'Gold' },
] as const;

export function UsersTable({ users }: { users: ConsoleUser[] }) {
  const [recherche, setRecherche] = useState('');
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const [aSupprimer, setASupprimer] = useState<ConsoleUser | null>(null);
  const [confirmation, setConfirmation] = useState('');

  const filtres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    if (!terme) return users;
    return users.filter((user) => user.email.toLowerCase().includes(terme));
  }, [users, recherche]);

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
        <input
          type="search"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder="Rechercher une adresse…"
          aria-label="Rechercher un compte"
          className="w-full max-w-xs rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm text-ink-900 outline-none transition focus:border-bordeaux-500 sm:w-auto"
        />
        <p className="text-xs text-ink-400">
          {filtres.length} compte{filtres.length > 1 ? 's' : ''}
        </p>
      </div>

      {erreur ? (
        <p role="alert" className="rounded-xl bg-bordeaux-50 px-4 py-3 text-sm text-bordeaux-700">
          {erreur}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-cream-300 bg-cream-50">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-cream-300 text-xs uppercase tracking-[0.12em] text-ink-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Compte</th>
              <th className="px-4 py-3 font-semibold">Formule</th>
              <th className="px-4 py-3 font-semibold">Activité</th>
              <th className="px-4 py-3 font-semibold">Inscrit le</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtres.map((user) => (
              <tr key={user.id} className="border-b border-cream-200 last:border-0">
                <td className="px-4 py-3">
                  <span className="font-medium text-ink-900">{user.email}</span>
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    {user.isSuperAdmin ? (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-ink">
                        Opérateur
                      </span>
                    ) : null}
                    {user.suspendedAt ? (
                      <span className="rounded-full bg-bordeaux-100 px-2 py-0.5 text-[11px] font-semibold text-bordeaux-700">
                        Suspendu
                      </span>
                    ) : null}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <select
                    value={user.plan}
                    disabled={enCours}
                    aria-label={`Formule de ${user.email}`}
                    onChange={(event) => lancer(() => setUserPlan(user.id, event.target.value))}
                    className="rounded-lg border border-cream-300 bg-cream-100 px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-bordeaux-500 disabled:opacity-50"
                  >
                    {PLANS.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-3 text-ink-600">
                  {user.proposalsCount} invit. · {user.responsesCount} rép.
                </td>

                <td className="px-4 py-3 text-ink-600">{formatShortDate(user.createdAt)}</td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={enCours || user.isSuperAdmin}
                      onClick={() => lancer(() => setUserSuspended(user.id, !user.suspendedAt))}
                      className="rounded-full border border-cream-300 px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:border-bordeaux-500 hover:text-bordeaux-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {user.suspendedAt ? 'Réactiver' : 'Suspendre'}
                    </button>
                    <button
                      type="button"
                      disabled={enCours || user.isSuperAdmin}
                      onClick={() => {
                        setASupprimer(user);
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
            ))}

            {filtres.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-400">
                  Aucun compte ne correspond.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {aSupprimer ? (
        <div className="rounded-[var(--radius-card)] border border-bordeaux-200 bg-bordeaux-50 p-5">
          <p className="font-serif text-lg font-bold text-bordeaux-700">
            Supprimer définitivement {aSupprimer.email} ?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            Ses {aSupprimer.proposalsCount} invitation{aSupprimer.proposalsCount > 1 ? 's' : ''} et
            toutes les réponses associées partent avec le compte. Cette action est irréversible.
            Retapez l’adresse pour confirmer.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={aSupprimer.email}
              aria-label="Confirmer l’adresse"
              className="w-full max-w-xs rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-bordeaux-500"
            />
            <button
              type="button"
              disabled={enCours || confirmation.trim().toLowerCase() !== aSupprimer.email.toLowerCase()}
              onClick={() =>
                lancer(async () => {
                  const resultat = await deleteUser(aSupprimer.id, confirmation);
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
