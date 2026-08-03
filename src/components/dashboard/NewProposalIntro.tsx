'use client';

import { AppPageHeader } from '@/components/ui/AppPageHeader';
import { useT } from '@/lib/i18n/use-t';

/** En-tête de la page de création, câblé sur le dictionnaire. */
export function NewProposalHeader() {
  const t = useT();

  return (
    <AppPageHeader
      backHref="/dashboard"
      backLabel={t.appPages.newBack}
      eyebrow={t.appPages.newEyebrow}
      title={t.appPages.newTitle}
      subtitle={t.appPages.newSubtitle}
    />
  );
}

/** Affiché à la place du formulaire quand le plafond du mois est atteint. */
export function QuotaReachedNotice() {
  const t = useT();

  return (
    <p className="mt-6 rounded-[var(--radius-vitrine)] border border-dashed border-cream-300 p-8 text-center text-sm leading-relaxed text-ink-400">
      {t.appPages.newQuotaReached}
    </p>
  );
}
