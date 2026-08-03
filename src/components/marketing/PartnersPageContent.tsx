'use client';

import { InquiryForm } from '@/components/marketing/InquiryForm';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/lib/i18n/use-t';

export function PartnersPageContent() {
  const t = useT();

  return (
    <>
      <PageHeader eyebrow={t.partnersPage.eyebrow} title={t.partnersPage.title1} accent={t.partnersPage.title2}>
        <p>{t.partnersPage.intro}</p>
      </PageHeader>

      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <section className="mt-14">
          <h2 className="font-serif text-2xl font-extrabold text-ink-900">{t.partnersPage.whoForTitle}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {t.partnersPage.profiles.map((profile, index) => (
              <div
                key={profile.title}
                data-reveal
                style={{ '--reveal-delay': `${index * 70}ms` } as React.CSSProperties}
                className="bloc bloc-plein p-6"
              >
                <h3 className="font-serif text-xl font-bold text-ink-900">{profile.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{profile.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-16 grid gap-14 lg:grid-cols-[380px_minmax(0,1fr)]">
          <section data-reveal>
            <h2 className="font-serif text-2xl font-extrabold text-ink-900">{t.partnersPage.howTitle}</h2>
            <ol className="mt-6 space-y-5">
              {t.partnersPage.steps.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cream-300 text-xs font-medium text-ink-400">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-ink-600">{step}</p>
                </li>
              ))}
            </ol>

            <p className="mt-8 rounded-xl border border-dashed border-cream-300 p-4 text-xs leading-relaxed text-ink-400">
              {t.partnersPage.programNote}
            </p>
          </section>

          <section data-reveal className="max-w-xl">
            <h2 className="font-serif text-2xl font-extrabold text-ink-900">{t.partnersPage.letsTalkTitle}</h2>
            <p className="mt-2 mb-6 text-sm leading-relaxed text-ink-400">{t.partnersPage.letsTalkIntro}</p>
            <InquiryForm
              kind="partner"
              messageLabel={t.partnersPage.messageLabel}
              messagePlaceholder={t.partnersPage.messagePlaceholder}
              submitLabel={t.partnersPage.submit}
            />
          </section>
        </div>
      </div>
    </>
  );
}
