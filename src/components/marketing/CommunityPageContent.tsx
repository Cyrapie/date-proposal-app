'use client';

import { LegalLayout } from '@/components/marketing/LegalLayout';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/lib/i18n/use-t';

export function CommunityPageContent() {
  const t = useT();

  return (
    <>
      <PageHeader eyebrow={t.communityPage.eyebrow} title={t.communityPage.title} accent={t.communityPage.accent}>
        <p>{t.communityPage.intro}</p>
      </PageHeader>

      <LegalLayout sections={t.communityPage.sections} />
    </>
  );
}
