/** Source unique de la navigation du site vitrine (header, footer, plan du site). */
export const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/partenaires', label: 'Devenir partenaire' },
  { href: '/blog', label: 'Blog' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
] as const;

export const CTA = { href: '/dashboard/new', label: 'Créer mon date' } as const;
