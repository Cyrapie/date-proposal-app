'use client';

import { LegalLayout } from '@/components/marketing/LegalLayout';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/lib/i18n/use-t';

export function ConditionsPageContent() {
  const t = useT();

  return (
    <>
      <PageHeader eyebrow={t.conditionsPage.eyebrow} title={t.conditionsPage.title} accent={t.conditionsPage.accent}>
        <p>{t.conditionsPage.intro}</p>
      </PageHeader>

      <LegalLayout sections={t.conditionsPage.sections} />
    </>
  );
}
