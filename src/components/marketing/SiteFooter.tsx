'use client';

import Link from 'next/link';

import { Heart } from '@/components/ui/Heart';
import { useT } from '@/lib/i18n/use-t';
import { NAV_LINKS } from '@/lib/marketing/nav';

export function SiteFooter() {
  const t = useT();

  return (
    <footer className="mt-24 border-t border-cream-300 bg-bordeaux-50">
      <div className="mx-auto w-full max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-bordeaux-500" />
              <span className="font-serif text-lg text-ink-900">Keerelle</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-400">{t.footer.tagline}</p>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="text-xs uppercase tracking-[0.16em] text-ink-400">{t.footer.siteHeading}</h2>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-600 transition hover:text-bordeaux-500"
                  >
                    {t.nav[link.navKey]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs uppercase tracking-[0.16em] text-ink-400">{t.footer.accountHeading}</h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-ink-600 transition hover:text-bordeaux-500"
                >
                  {t.footer.login}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-ink-600 transition hover:text-bordeaux-500"
                >
                  {t.footer.myInvitations}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-ink-600 transition hover:text-bordeaux-500"
                >
                  {t.footer.confidentiality}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-cream-300 pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Otyche</p>

          <nav aria-label={t.footer.legalNavLabel} className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition hover:text-bordeaux-500">
              {t.footer.privacy}
            </Link>
            <Link href="/regles-communaute" className="transition hover:text-bordeaux-500">
              {t.footer.community}
            </Link>
            <Link href="/conditions-generales" className="transition hover:text-bordeaux-500">
              {t.footer.terms}
            </Link>
            <Link href="/mentions-legales" className="transition hover:text-bordeaux-500">
              {t.footer.legal}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
