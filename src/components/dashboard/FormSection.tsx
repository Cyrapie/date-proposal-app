import type { ReactNode } from 'react';

/**
 * Titre d'une section du formulaire de création.
 *
 * Reprend le rythme des titres de la vitrine — numéro, titre serif, puis une
 * ligne d'explication — pour découper un formulaire long en étapes lisibles.
 * Le numéro est décoratif : le formulaire reste d'une seule pièce, on ne
 * navigue pas d'une section à l'autre.
 */
export function FormSection({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-7">
      <header className="flex items-start gap-3 border-b border-cream-300 pb-4">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent font-serif text-sm font-bold text-accent-ink"
        >
          {step}
        </span>
        <div className="min-w-0">
          <h2 className="font-serif text-xl font-bold leading-tight text-ink-900">{title}</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-400">{hint}</p>
        </div>
      </header>

      <div className="space-y-8">{children}</div>
    </section>
  );
}
