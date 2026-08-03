'use client';

import Link from 'next/link';

import { Heart } from '@/components/ui/Heart';
import { useT } from '@/lib/i18n/use-t';
import { NAV_LINKS } from '@/lib/marketing/nav';

/** Une colonne de liens, avec son titre en petites capitales. */
function FooterColumn({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={heading}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">{heading}</h2>
      <ul className="mt-5 space-y-3">{children}</ul>
    </nav>
  );
}

const linkClass = 'text-sm text-ink-600 transition hover:text-bordeaux-500';

export function SiteFooter() {
  const t = useT();

  return (
    <footer className="mt-24 border-t border-cream-300 bg-bordeaux-50">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-bordeaux-500" />
              <span className="font-serif text-lg text-ink-900">Keerelle</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-400">{t.footer.tagline}</p>
          </div>

          <FooterColumn heading={t.footer.siteHeading}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {t.nav[link.navKey]}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn heading={t.footer.accountHeading}>
            <li>
              <Link href="/login" className={linkClass}>
                {t.footer.login}
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className={linkClass}>
                {t.footer.myInvitations}
              </Link>
            </li>
          </FooterColumn>

          <FooterColumn heading={t.footer.legalHeading}>
            <li>
              <Link href="/privacy" className={linkClass}>
                {t.footer.privacy}
              </Link>
            </li>
            <li>
              <Link href="/regles-communaute" className={linkClass}>
                {t.footer.community}
              </Link>
            </li>
            <li>
              <Link href="/conditions-generales" className={linkClass}>
                {t.footer.terms}
              </Link>
            </li>
            <li>
              <Link href="/mentions-legales" className={linkClass}>
                {t.footer.legal}
              </Link>
            </li>
          </FooterColumn>
        </div>

        <div className="mt-14 flex flex-col-reverse items-center gap-3 border-t border-cream-300 pt-6 text-xs text-ink-400 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} Keerelle. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
