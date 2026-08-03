'use client';

import Link from 'next/link';

import { AppPageHeader } from '@/components/ui/AppPageHeader';
import { BrandIcon } from '@/components/ui/BrandLogo';
import { useT } from '@/lib/i18n/use-t';

export function LoginHeader() {
  const t = useT();

  return (
    <AppPageHeader
      align="center"
      eyebrow={t.authForm.eyebrow}
      title={t.authForm.title}
      subtitle={t.authForm.subtitle}
    >
      {/* L'icône officielle plutôt qu'un emoji clé : même mark que l'en-tête
          et le pied de page, pas une approximation. */}
      <BrandIcon size={40} className="mx-auto mb-4" />
    </AppPageHeader>
  );
}

/** Pied de page de l'écran de connexion : retour vitrine et confidentialité. */
export function LoginFooterLinks() {
  const t = useT();

  return (
    <p className="mt-8 text-center text-xs text-ink-400">
      <Link href="/" className="underline underline-offset-4 hover:text-ink-600">
        {t.authForm.backHome}
      </Link>
      <span className="mx-2">·</span>
      <Link href="/privacy" className="underline underline-offset-4 hover:text-ink-600">
        {t.authForm.privacyLink}
      </Link>
    </p>
  );
}
