'use client';

import { Faq } from '@/components/marketing/Faq';
import { InquiryForm } from '@/components/marketing/InquiryForm';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useT } from '@/lib/i18n/use-t';

export function ContactPageContent() {
  const t = useT();

  return (
    <>
      <PageHeader eyebrow={t.contactPage.eyebrow} title={t.contactPage.title1} accent={t.contactPage.title2}>
        <p>{t.contactPage.intro}</p>
      </PageHeader>

      <div className="mx-auto w-full max-w-2xl px-5 py-16">
        <h2 className="font-serif text-3xl font-black text-ink-900">{t.contactPage.writeUs}</h2>
        <p className="mt-2 mb-8 text-sm leading-relaxed text-ink-400">{t.contactPage.hint}</p>
        <InquiryForm
          kind="contact"
          messageLabel={t.contactPage.messageLabel}
          messagePlaceholder={t.contactPage.messagePlaceholder}
          submitLabel={t.contactPage.submit}
        />
      </div>

      <Faq items={t.contactPage.faq} />
    </>
  );
}
