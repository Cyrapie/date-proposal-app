import type { ReactNode } from 'react';

export const inputClass =
  'w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 text-base text-ink-900 outline-none transition focus:border-bordeaux-500 focus:ring-2 focus:ring-bordeaux-100 placeholder:text-ink-400/70';

type FieldProps = {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

export function Field({ label, htmlFor, hint, error, required, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-600">
        {label}
        {required ? <span className="ml-1 text-bordeaux-500">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs leading-relaxed text-ink-400">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-bordeaux-600">{error}</p> : null}
    </div>
  );
}
