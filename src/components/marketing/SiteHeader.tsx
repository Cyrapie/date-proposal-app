'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Heart } from '@/components/ui/Heart';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CTA, NAV_LINKS } from '@/lib/marketing/nav';
import { EASE_OUT_EXPO } from '@/lib/motion';

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // La fermeture au clic est portée par les liens eux-mêmes (`onClick`) plutôt
  // que par un effet sur `pathname` : réagir à la navigation dans un effet
  // déclenche un rendu en cascade inutile.
  const close = () => setOpen(false);

  // Empêche le défilement de l'arrière-plan quand le menu plein écran est ouvert.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-cream-300 bg-cream-100/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-ink-900"
          aria-label="Accueil"
        >
          <Heart className="h-5 w-5 text-bordeaux-500" />
          <span className="font-serif text-lg leading-none">Une invitation</span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`text-sm transition hover:text-ink-900 ${
                    isActive(link.href)
                      ? 'font-medium text-ink-900'
                      : 'text-ink-600'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link
            href={CTA.href}
            className="hidden rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition hover:bg-accent-hover active:scale-[0.98] sm:block"
          >
            {CTA.label}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 text-ink-600 transition hover:border-bordeaux-500 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="menu-mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
            className="border-t border-cream-300 bg-cream-50 lg:hidden"
          >
            <nav aria-label="Navigation mobile" className="mx-auto w-full max-w-6xl px-5 py-4">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      aria-current={isActive(link.href) ? 'page' : undefined}
                      className={`block rounded-xl px-3 py-3 text-base transition ${
                        isActive(link.href)
                          ? 'bg-bordeaux-50 font-medium text-bordeaux-600'
                          : 'text-ink-600 hover:bg-cream-300'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                href={CTA.href}
                onClick={close}
                className="mt-3 block rounded-full bg-accent px-6 py-3.5 text-center text-base font-medium text-accent-ink sm:hidden"
              >
                {CTA.label}
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
