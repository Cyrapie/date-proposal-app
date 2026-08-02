import { listConsoleAudit } from '@/lib/console/data';
import { formatDateTime } from '@/lib/format';

export const metadata = { title: 'Journal' };

/** Libellés lisibles des actions ; une action inconnue s'affiche telle quelle. */
const ACTIONS: Record<string, { label: string; ton: 'neutre' | 'attention' | 'grave' }> = {
  'user.plan_changed': { label: 'Formule modifiée', ton: 'neutre' },
  'user.suspended': { label: 'Compte suspendu', ton: 'attention' },
  'user.unsuspended': { label: 'Compte réactivé', ton: 'neutre' },
  'user.deleted': { label: 'Compte supprimé', ton: 'grave' },
  'proposal.expired': { label: 'Invitation désactivée', ton: 'attention' },
  'proposal.deleted': { label: 'Invitation supprimée', ton: 'grave' },
};

const TONS = {
  neutre: 'bg-cream-200 text-ink-600',
  attention: 'bg-bordeaux-50 text-bordeaux-600',
  grave: 'bg-bordeaux-100 text-bordeaux-700',
} as const;

export default async function ConsoleJournalPage() {
  const entries = await listConsoleAudit();

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-black text-ink-900">Journal d’activité</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-400">
          Trace de chaque action d’administration. Écrit une fois, jamais modifié ni supprimé
          depuis l’application — 200 entrées les plus récentes.
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-cream-300 p-10 text-center text-sm text-ink-400">
          Aucune action enregistrée pour l’instant.
        </p>
      ) : (
        <ol className="space-y-2.5">
          {entries.map((entry) => {
            const meta = ACTIONS[entry.action];
            const details = Object.entries(entry.details);

            return (
              <li
                key={entry.id}
                className="rounded-[var(--radius-card)] border border-cream-300 bg-cream-50 p-4"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      TONS[meta?.ton ?? 'neutre']
                    }`}
                  >
                    {meta?.label ?? entry.action}
                  </span>
                  {entry.targetLabel ? (
                    <span className="text-sm font-medium text-ink-900">{entry.targetLabel}</span>
                  ) : null}
                  <span className="ml-auto text-xs text-ink-400">
                    {formatDateTime(entry.createdAt)}
                  </span>
                </div>

                <p className="mt-2 text-xs text-ink-400">
                  Par {entry.actorEmail}
                  {details.length > 0
                    ? ` · ${details.map(([cle, valeur]) => `${cle} : ${String(valeur)}`).join(', ')}`
                    : ''}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
