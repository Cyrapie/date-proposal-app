/**
 * Barres à teinte unique, triées, directement étiquetées.
 *
 * Une seule série par nature (une répartition), donc une seule teinte suffit :
 * l'identité de chaque ligne vient de son étiquette, pas de sa couleur. Pas
 * de légende nécessaire — c'est le titre qui nomme la série.
 */
export function RankedBars({
  title,
  items,
  emptyLabel = 'Aucune donnée pour l’instant.',
}: {
  title: string;
  items: { label: string; value: number }[];
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  const triés = [...items].sort((a, b) => b.value - a.value);

  return (
    <div className="bloc p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">{title}</p>

      {triés.length === 0 ? (
        <p className="mt-4 text-sm text-ink-400">{emptyLabel}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {triés.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="text-sm text-ink-600">{item.label}</span>
                <span className="text-sm font-semibold text-ink-900">{item.value}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-cream-200">
                <div
                  className="h-full rounded-full bg-[color:var(--color-chart-primary)]"
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
