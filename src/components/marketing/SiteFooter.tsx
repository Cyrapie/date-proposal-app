import Link from 'next/link';

import { Heart } from '@/components/ui/Heart';
import { NAV_LINKS } from '@/lib/marketing/nav';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-cream-300 bg-bordeaux-50">
      <div className="mx-auto w-full max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-bordeaux-500" />
              <span className="font-serif text-lg text-ink-900">Une invitation</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-400">
              Proposez un rendez-vous en un lien. La personne choisit, et tout part dans vos
              agendas.
            </p>
          </div>

          <nav aria-label="Navigation de bas de page">
            <h2 className="text-xs uppercase tracking-[0.16em] text-ink-400">Le site</h2>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-600 transition hover:text-bordeaux-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs uppercase tracking-[0.16em] text-ink-400">Votre compte</h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-ink-600 transition hover:text-bordeaux-500"
                >
                  Se connecter
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-ink-600 transition hover:text-bordeaux-500"
                >
                  Mes invitations
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-ink-600 transition hover:text-bordeaux-500"
                >
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-cream-300 pt-6 text-xs text-ink-400">
          © {new Date().getFullYear()} Une invitation. Aucune connexion à votre agenda : les
          rendez-vous sont transmis par fichier .ics.
        </p>
      </div>
    </footer>
  );
}
