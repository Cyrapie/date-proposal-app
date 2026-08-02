'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const CONSOLE_LINKS = [
  { href: '/console', label: 'Vue d’ensemble' },
  { href: '/console/utilisateurs', label: 'Utilisateurs' },
  { href: '/console/invitations', label: 'Invitations' },
  { href: '/console/journal', label: 'Journal' },
  { href: '/console/systeme', label: 'Système' },
] as const;

export function ConsoleNav() {
  const pathname = usePathname();

  const estActif = (href: string) =>
    href === '/console' ? pathname === '/console' : pathname.startsWith(href);

  return (
    <nav aria-label="Navigation de la console" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {CONSOLE_LINKS.map((link) => {
        const actif = estActif(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={actif ? 'page' : undefined}
            className={`shrink-0 rounded-xl px-3.5 py-2.5 text-sm transition ${
              actif
                ? 'bg-bordeaux-50 font-semibold text-bordeaux-600'
                : 'text-ink-600 hover:bg-cream-200 hover:text-ink-900'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
