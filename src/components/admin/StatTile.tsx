/** Nombre unique en avant, sans encodage couleur : un chiffre n'a pas besoin de teinte. */
export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="bloc p-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">{label}</p>
      <p className="mt-2 font-serif text-4xl font-black text-ink-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
    </div>
  );
}
