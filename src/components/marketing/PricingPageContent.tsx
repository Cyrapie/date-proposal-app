'use client';

import { TrackSection } from '@/components/analytics/TrackSection';
import { Faq } from '@/components/marketing/Faq';
import { PageHeader } from '@/components/marketing/PageHeader';
import { PricingTable } from '@/components/marketing/PricingTable';
import type { CurrencyPreference } from '@/lib/domain/countries';
import { useT } from '@/lib/i18n/use-t';

export function PricingPageContent({ devise }: { devise: CurrencyPreference }) {
  const t = useT();

  return (
    <>
      <PageHeader eyebrow={t.pricingPage.eyebrow} title={t.pricingPage.title1} accent={t.pricingPage.title2} align="center">
        <p>{t.pricingPage.intro}</p>
      </PageHeader>

      <TrackSection id="pricing-table" label="Grille tarifaire">
        <section className="py-16">
          <PricingTable devise={devise} />

          <p className="mx-auto mt-10 max-w-2xl px-5 text-center text-sm leading-relaxed text-ink-400">
            {t.pricingPage.note}
          </p>
        </section>
      </TrackSection>

      <Faq items={t.pricingPage.faq} />
    </>
  );
}
