'use client';

import Link from 'next/link';

import { BrandLockup } from '@/components/ui/BrandLogo';
import { useT } from '@/lib/i18n/use-t';
import { CTA_HREF } from '@/lib/marketing/nav';

/**
 * Deux bandes au fond distinct plutôt qu'un simple filet interne : c'est le
 * changement de couleur lui-même qui sépare l'identité (haut) du légal (bas),
 * pas une ligne de plus à l'intérieur d'un même bloc.
 */
export function SiteFooter() {
  const t = useT();

  return (
    <footer className="mt-16">
      <div className="border-t border-cream-300 bg-bordeaux-50">
        <div className="mx-auto w-full max-w-xl px-5 py-10 text-center sm:py-12">
          {/* Centré par le `text-center` du conteneur, pas par un `mx-auto`
              qui n'aurait aucun effet sur un élément `inline-block`. */}
          <BrandLockup height={30} />

          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
            {t.footer.tagline}
          </p>

          <Link
            href={CTA_HREF}
            data-track-link="cta-footer"
            className="mt-5 inline-block rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-ink shadow-[0_12px_32px_rgba(109,27,44,0.28)] transition hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-[0_16px_40px_rgba(109,27,44,0.34)] active:translate-y-0 active:scale-[0.99]"
          >
            {t.nav.cta}
          </Link>
        </div>
      </div>

      <div className="border-t border-cream-300 bg-cream-200">
        <div className="mx-auto w-full max-w-xl px-5 py-6 text-center">
          <nav aria-label={t.footer.legalNavLabel}>
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-ink-400">
              <li>
                <Link
                  href="/privacy"
                  data-track-link="footer-privacy"
                  className="transition hover:text-bordeaux-500"
                >
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href="/regles-communaute"
                  data-track-link="footer-community"
                  className="transition hover:text-bordeaux-500"
                >
                  {t.footer.community}
                </Link>
              </li>
              <li>
                <Link
                  href="/conditions-generales"
                  data-track-link="footer-terms"
                  className="transition hover:text-bordeaux-500"
                >
                  {t.footer.terms}
                </Link>
              </li>
              <li>
                <Link
                  href="/mentions-legales"
                  data-track-link="footer-legal"
                  className="transition hover:text-bordeaux-500"
                >
                  {t.footer.legal}
                </Link>
              </li>
            </ul>
          </nav>

          <p className="mt-2.5 text-xs text-ink-400">
            © {new Date().getFullYear()} Keerelle. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
