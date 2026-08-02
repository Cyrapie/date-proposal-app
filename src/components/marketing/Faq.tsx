'use client';

import { useT } from '@/lib/i18n/use-t';

export type FaqItem = { q: string; a: string };

/**
 * Accordéon en HTML natif (`<details>`) : accessible au clavier et fonctionnel
 * sans JavaScript pour le contenu — seul l'intitulé de section réagit à la
 * langue courante.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  const t = useT();

  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-20">
      <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-bordeaux-500">
        {t.faqHeading.eyebrow}
      </p>
      <h2 className="mt-4 text-center font-serif text-4xl font-black leading-[1.06] text-ink-900">
        {t.faqHeading.title}
      </h2>

      <div className="mt-10 space-y-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="bloc group px-6 open:border-bordeaux-200 open:bg-bordeaux-50"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-ink-900 marker:content-none">
              {item.q}
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bordeaux-50 text-bordeaux-500 transition group-open:rotate-45"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <p className="pb-5 text-sm leading-relaxed text-ink-600">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
