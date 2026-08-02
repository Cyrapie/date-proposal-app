'use client';

import Link from 'next/link';

import { PageHeader } from '@/components/marketing/PageHeader';
import { Heart } from '@/components/ui/Heart';
import { useT } from '@/lib/i18n/use-t';
import { CTA_HREF } from '@/lib/marketing/nav';

export function AboutPageContent() {
  const t = useT();

  return (
    <>
      <PageHeader eyebrow={t.aboutPage.eyebrow} title={t.aboutPage.title} accent={t.aboutPage.accent}>
        <p>{t.aboutPage.intro}</p>
      </PageHeader>

      <div className="mx-auto w-full max-w-3xl px-5 py-16">
        <div className=" space-y-5 text-base leading-relaxed text-ink-600">
          {t.aboutPage.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="font-serif text-3xl font-black text-ink-900">{t.aboutPage.principlesTitle}</h2>
          <dl className="mt-8 space-y-8">
            {t.aboutPage.principles.map((principle) => (
              <div key={principle.title}>
                <dt className="flex items-start gap-3">
                  <Heart className="mt-1 h-4 w-4 shrink-0 text-bordeaux-600" />
                  <span className="font-serif text-xl font-bold text-ink-900">{principle.title}</span>
                </dt>
                <dd className="mt-2 pl-7 text-base leading-relaxed text-ink-600">{principle.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-16 rounded-[var(--radius-vitrine)] border border-cream-300 bg-cream-50 p-8">
          <h2 className="font-serif text-2xl font-extrabold text-ink-900">{t.aboutPage.dataTitle}</h2>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            {t.aboutPage.dataBodyBefore}{' '}
            <Link href="/privacy" className="text-bordeaux-600 underline underline-offset-4">
              {t.aboutPage.dataLinkLabel}
            </Link>
            {t.aboutPage.dataBodyAfter}
          </p>
        </section>

        <div className="mt-16 text-center">
          <Link
            href={CTA_HREF}
            className="inline-block rounded-full bg-accent px-8 py-4 text-base font-medium text-accent-ink transition hover:bg-accent-hover active:scale-[0.99]"
          >
            {t.nav.cta}
          </Link>
        </div>
      </div>
    </>
  );
}
