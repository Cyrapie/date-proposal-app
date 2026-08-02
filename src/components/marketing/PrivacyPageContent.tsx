'use client';

import { LegalLayout } from '@/components/marketing/LegalLayout';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/lib/i18n/use-t';
import { publicEnv } from '@/lib/env';

export function PrivacyPageContent() {
  const t = useT();

  return (
    <>
      <PageHeader eyebrow={t.privacyPage.eyebrow} title={t.privacyPage.title} accent={t.privacyPage.accent}>
        <p>{t.privacyPage.intro(publicEnv.defaultExpiryDays)}</p>
      </PageHeader>

      <LegalLayout sections={t.privacyPage.sections} />
    </>
  );
}
