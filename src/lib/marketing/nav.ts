import type { Dictionary } from '@/lib/i18n/dictionary';

/**
 * Source unique de la navigation du site vitrine (header, footer, plan du
 * site). Les libellés viennent du dictionnaire i18n via `navKey` ; seuls les
 * chemins sont fixes ici.
 */
export const NAV_LINKS = [
  { href: '/', navKey: 'home' },
  { href: '/tarifs', navKey: 'pricing' },
  { href: '/partenaires', navKey: 'partners' },
  { href: '/blog', navKey: 'blog' },
  { href: '/a-propos', navKey: 'about' },
  { href: '/contact', navKey: 'contact' },
] as const satisfies ReadonlyArray<{ href: string; navKey: keyof Dictionary['nav'] }>;

export const CTA_HREF = '/dashboard/new';
