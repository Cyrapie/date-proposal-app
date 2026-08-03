'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * En-tête des pages applicatives (création, connexion).
 *
 * Même rythme que `PageHeader` côté vitrine — surtitre en capitales espacées,
 * titre serif, paragraphe — mais sans le bandeau teinté : ces pages sont des
 * outils, pas des pages d'atterrissage. Composant client parce que ses libellés
 * viennent du dictionnaire, dont la langue n'est connue que du navigateur.
 */
export function AppPageHeader({
  eyebrow,
  title,
  subtitle,
  backHref,
  backLabel,
  align = 'left',
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Lien de retour, affiché au-dessus du surtitre. */
  backHref?: string;
  backLabel?: string;
  align?: 'left' | 'center';
  /** Ornement au-dessus du titre, par exemple un logo. */
  children?: ReactNode;
}) {
  const centre = align === 'center';

  return (
    <header className={centre ? 'text-center' : ''}>
      {backHref && backLabel ? (
        <Link
          href={backHref}
          className="inline-block text-xs text-ink-400 underline underline-offset-4 transition hover:text-ink-600"
        >
          {backLabel}
        </Link>
      ) : null}

      {children ? <div className={backHref ? 'mt-6' : ''}>{children}</div> : null}

      <p
        className={`text-xs font-bold uppercase tracking-[0.2em] text-bordeaux-500 ${
          backHref && !children ? 'mt-6' : ''
        }`}
      >
        {eyebrow}
      </p>

      <h1 className="mt-3 font-serif text-3xl font-black leading-[1.06] text-ink-900 sm:text-4xl">
        {title}
      </h1>

      {subtitle ? (
        <p
          className={`mt-3 text-sm leading-relaxed text-ink-400 ${centre ? 'mx-auto max-w-md' : 'max-w-xl'}`}
        >
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
