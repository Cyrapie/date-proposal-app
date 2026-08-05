import { formatShortDate } from '@/lib/format';

type Point = { day: string; pageViews: number };

/**
 * Vues de page par jour. Composant autonome plutôt qu'une généralisation de
 * `GrowthChart` : celui-ci a une forme à deux séries hardcodée (invitations/
 * comptes), propre à la page d'ensemble — le réutiliser demanderait de le
 * refactorer pour ce seul nouvel appelant, sans bénéfice ici.
 */
export function AnalyticsTrendChart({ data }: { data: Point[] }) {
  const max = Math.max(1, ...data.map((point) => point.pageViews));

  return (
    <div className="bloc p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
        Vues de page — 30 derniers jours
      </p>

      <div className="mt-5 overflow-x-auto">
        <div className="flex h-40 min-w-[640px] items-end gap-1.5">
          {data.map((point) => (
            <div
              key={point.day}
              className="flex flex-1 items-end justify-center"
              title={`${formatShortDate(point.day)} — ${point.pageViews} vue${point.pageViews > 1 ? 's' : ''}`}
            >
              <div
                className="w-2.5 rounded-t bg-[color:var(--color-chart-primary)]"
                style={{ height: `${Math.max(2, (point.pageViews / max) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex min-w-[640px] justify-between text-[10px] text-ink-400">
          <span>{data[0] ? formatShortDate(data[0].day) : ''}</span>
          <span>{data.at(-1) ? formatShortDate(data.at(-1)!.day) : ''}</span>
        </div>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-xs text-ink-400 underline underline-offset-4">
          Voir les valeurs en tableau
        </summary>
        <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-cream-300">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-cream-100">
              <tr>
                <th className="px-3 py-2 font-semibold text-ink-600">Jour</th>
                <th className="px-3 py-2 font-semibold text-ink-600">Vues de page</th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr key={point.day} className="border-t border-cream-200">
                  <td className="px-3 py-1.5 text-ink-600">{formatShortDate(point.day)}</td>
                  <td className="px-3 py-1.5 text-ink-900">{point.pageViews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
