'use client';

import { useEffect, useState } from 'react';

import { useT } from '@/lib/i18n/use-t';

/**
 * Bouton flottant de retour en haut de page.
 *
 * N'apparaît qu'après un défilement significatif : sur une page courte, un
 * bouton toujours visible n'aurait rien à faire. Le seuil suit la hauteur de
 * l'écran plutôt qu'une valeur fixe, pour rester cohérent du mobile au grand
 * écran.
 */
export function BackToTop() {
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label={t.common.backToTop}
      title={t.common.backToTop}
      className={`fixed bottom-6 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-cream-300 bg-cream-50/95 text-ink-600 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-bordeaux-500 hover:text-bordeaux-500 sm:bottom-8 sm:right-8 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
