'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { Benefits } from '@/components/marketing/Benefits';
import { Faq } from '@/components/marketing/Faq';
import { OccasionCarousel } from '@/components/marketing/OccasionCarousel';
import { Testimonials } from '@/components/marketing/Testimonials';
import { useT } from '@/lib/i18n/use-t';
import { CTA_HREF } from '@/lib/marketing/nav';

/**
 * Le teaser du blog lit le système de fichiers : il reste rendu côté serveur
 * et arrive ici en prop, un composant client ne pouvant pas l'importer.
 */
export function HomeContent({ blogTeaser }: { blogTeaser: ReactNode }) {
  const t = useT();

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-bordeaux-50 to-transparent"
        />

        <div className="relative mx-auto w-full max-w-6xl px-5 pt-14 pb-8 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h1 className="font-serif text-[2.7rem] font-black leading-[1.04] text-ink-900 sm:text-6xl">
                {t.home.heroTitle1}
                <br />
                <span className="gradient-text">{t.home.heroTitle2}</span>
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-600">{t.home.heroBody}</p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={CTA_HREF}
                  className="rounded-full bg-accent px-8 py-4 text-center text-base font-semibold text-accent-ink shadow-[0_12px_32px_rgba(109,27,44,0.28)] transition hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_16px_40px_rgba(109,27,44,0.34)] active:translate-y-0 active:scale-[0.99]"
                >
                  {t.nav.cta}
                </Link>
                <Link
                  href="/a-propos"
                  className="rounded-full border border-cream-300 bg-cream-50 px-8 py-4 text-center text-base font-medium text-bordeaux-600 transition hover:-translate-y-0.5 hover:border-bordeaux-500 hover:bg-bordeaux-50"
                >
                  {t.home.ctaHow}
                </Link>
              </div>

              {/* Trois colonnes centrées sur une seule ligne, séparées par un
                  filet fin : chaque icône reste au-dessus de son chiffre au
                  lieu de lui disputer la largeur, donc les trois tiennent
                  même dans la colonne étroite du héros. */}
              <dl className="mt-10 flex items-start justify-between gap-2 sm:justify-start sm:gap-10">
                {t.home.proof.map((item, index) => (
                  <div
                    key={item.label}
                    className={`flex-1 text-center sm:flex-none ${
                      index > 0 ? 'border-l border-cream-300 pl-2 sm:pl-10' : ''
                    }`}
                  >
                    <span aria-hidden="true" className="text-lg">
                      {item.icon}
                    </span>
                    <dd className="mt-1 font-serif text-2xl font-extrabold text-bordeaux-600">
                      {item.value}
                    </dd>
                    <dt className="mt-0.5 text-xs leading-snug text-ink-400">{item.label}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <OccasionCarousel />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Pourquoi nous */}
      <Benefits />

      {/* -------------------------------------------------------- Comment faire */}
      <section className="bg-bordeaux-50 py-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-bordeaux-500">
            {t.home.stepsEyebrow}
          </p>
          <h2 className="mt-4 max-w-xl font-serif text-4xl font-black leading-[1.06] text-ink-900 sm:text-5xl">
            {t.home.stepsTitle}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-600">{t.home.stepsBody}</p>

          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.home.steps.map((step, index) => (
              <li
                key={step.title}
                data-reveal
                style={{ '--reveal-delay': `${index * 80}ms` } as React.CSSProperties}
                className="bloc bloc-plein p-7"
              >
                <span data-fixe className="pastille flex h-10 w-10 items-center justify-center rounded-2xl bg-accent font-serif text-lg text-accent-ink">
                  {index + 1}
                </span>
                <h3 className="mt-5 font-serif text-xl font-bold text-ink-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------------------------------------------- Témoignages */}
      <Testimonials />

      {/* ------------------------------------------------------------- Articles */}
      {blogTeaser}

      {/* ------------------------------------------------------------------ FAQ */}
      <Faq items={t.homeFaq} />

      {/* ------------------------------------------------------ Appel à l'action */}
      <section className="mx-auto w-full max-w-6xl px-5 pb-4">
        <div
          data-reveal
          className="gradient-bordeaux rounded-[var(--radius-vitrine)] px-8 py-16 text-center sm:px-16"
        >
          <span aria-hidden="true" className="text-4xl">
            ✉️
          </span>
          <h2 className="mt-6 font-serif text-4xl leading-tight text-accent-ink sm:text-5xl">
            {t.home.ctaTitle1}
            <br className="hidden sm:block" /> {t.home.ctaTitle2}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-accent-ink/85">{t.home.ctaBody}</p>
          <Link
            href={CTA_HREF}
            className="mt-8 inline-block rounded-full bg-cream-50 px-10 py-4 text-base font-semibold text-bordeaux-700 transition hover:-translate-y-0.5 hover:bg-bordeaux-50 active:translate-y-0 active:scale-[0.99]"
          >
            {t.nav.cta}
          </Link>
        </div>
      </section>
    </>
  );
}
