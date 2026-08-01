import type { ReactNode } from 'react';

/**
 * Champs du site vitrine. Séparé de `ui/Field` volontairement : celui-ci porte
 * la palette violet/rose, l'autre reste sur crème/bordeaux pour le dashboard.
 */
export const marketingInputClass =
  'w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3.5 text-base text-ink-900 outline-none transition focus:border-bordeaux-500 focus:ring-4 focus:ring-cream-300 placeholder:text-ink-400/70';

export function MarketingField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink-900">
        {label}
        {required ? <span className="ml-1 text-bordeaux-500">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs leading-relaxed text-ink-400">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-bordeaux-700">{error}</p> : null}
    </div>
  );
}
