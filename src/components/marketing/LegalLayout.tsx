'use client';

import { useEffect, useState } from 'react';

import { useT } from '@/lib/i18n/use-t';

export type LegalSection = {
  /** Ancre de la section, utilisée pour le lien et le scrollspy. */
  id: string;
  title: string;
  paragraphs: string[];
  /** Encart mis en avant, pour un point qui mérite d'être remarqué. */
  note?: string;
};

/**
 * Mise en page à deux colonnes pour les pages légales (confidentialité,
 * conditions, règles…) : sommaire collant à gauche qui suit la section lue,
 * sections numérotées à droite. Les couleurs viennent uniquement des tokens
 * du design system (`--c-*`), donc la mise en page suit le mode sombre sans
 * réglage supplémentaire.
 */
export function LegalLayout({ sections }: { sections: LegalSection[] }) {
  const t = useT();
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      // Fenêtre resserrée en haut de viewport : la section active est celle
      // qui vient de franchir le sommet, pas celle qui pointe déjà en bas.
      { rootMargin: '-10% 0px -75% 0px', threshold: 0 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[260px_1fr] lg:gap-16">
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-[var(--radius-card)] border border-cream-300 bg-cream-50 p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="6" y="4" width="12" height="17" rx="2" />
              <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
              <path d="M9 11h6M9 15h6" />
            </svg>
            {t.legalCommon.toc}
          </div>

          <nav aria-label={t.legalCommon.toc} className="mt-4 space-y-1.5">
            {sections.map((section, index) => {
              const active = section.id === activeId;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  aria-current={active ? 'true' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                    active
                      ? 'bg-bordeaux-50 font-semibold text-bordeaux-600'
                      : 'text-ink-600 hover:bg-cream-200 hover:text-ink-900'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                      active ? 'bg-accent text-accent-ink' : 'bg-cream-200 text-ink-400'
                    }`}
                  >
                    {index + 1}
                  </span>
                  {section.title}
                </a>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="space-y-14">
        {sections.map((section, index) => (
          <section key={section.id} id={section.id} className="scroll-mt-8">
            <div className="flex items-start gap-4">
              <span
                data-fixe
                className="pastille flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent font-serif text-lg text-accent-ink"
              >
                {index + 1}
              </span>
              <h2 className="mt-1 font-serif text-2xl font-extrabold text-ink-900">
                {section.title}
              </h2>
            </div>

            <div className="mt-4 space-y-3 pl-14">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-ink-600">
                  {paragraph}
                </p>
              ))}

              {section.note ? (
                <div className="flex items-start gap-3 rounded-2xl border border-bordeaux-200 bg-bordeaux-50 px-4 py-3.5">
                  <svg
                    viewBox="0 0 24 24"
                    className="mt-0.5 h-4 w-4 shrink-0 text-bordeaux-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v5M12 8h.01" />
                  </svg>
                  <p className="text-sm font-medium leading-relaxed text-bordeaux-700">
                    {section.note}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
