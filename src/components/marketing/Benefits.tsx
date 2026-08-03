'use client';

/** Bloc « Pourquoi choisir ». Chaque carte bascule en bordeaux au survol. */

import { useT } from '@/lib/i18n/use-t';

export function Benefits() {
  const t = useT();

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-bordeaux-500">
          {t.benefits.eyebrow}
        </p>
        <h2 className="mt-4 font-serif text-4xl font-black leading-[1.06] text-ink-900 sm:text-5xl">
          {t.benefits.title1}
          <br className="hidden sm:block" /> {t.benefits.title2}
        </h2>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {t.benefits.items.map((benefit, index) => (
          <article
            key={benefit.title}
            data-reveal
            style={{ '--reveal-delay': `${Math.min(index, 4) * 70}ms` } as React.CSSProperties}
            className="bloc bloc-plein p-7"
          >
            <span
              aria-hidden="true"
              data-fixe
              className="pastille flex h-12 w-12 items-center justify-center rounded-2xl bg-bordeaux-50 text-2xl"
            >
              {benefit.icon}
            </span>
            <h3 className="mt-5 font-serif text-xl font-bold text-ink-900">{benefit.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{benefit.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
