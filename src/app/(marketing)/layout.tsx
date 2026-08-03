import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { BackToTop } from '@/components/ui/BackToTop';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

/**
 * Chrome du site vitrine. Le groupe de routes `(marketing)` n'ajoute aucun
 * segment d'URL : /partenaires, /blog… restent à la racine. Le parcours
 * destinataire et le dashboard n'héritent pas de cet en-tête.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Fond blanc explicite : le `body` global est crème pour le parcours
    // destinataire, la vitrine a sa propre base.
    <div className="flex min-h-dvh flex-col bg-cream-50">
      <ScrollReveal />
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}
