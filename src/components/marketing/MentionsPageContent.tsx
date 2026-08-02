'use client';

import { LegalLayout } from '@/components/marketing/LegalLayout';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/lib/i18n/use-t';

export function MentionsPageContent() {
  const t = useT();

  return (
    <>
      <PageHeader eyebrow={t.mentionsPage.eyebrow} title={t.mentionsPage.title} accent={t.mentionsPage.accent}>
        <p>{t.mentionsPage.intro}</p>
      </PageHeader>

      <LegalLayout sections={t.mentionsPage.sections} />
    </>
  );
}
