'use client';

import { useEffect } from 'react';

import { trackLinkClick } from '@/lib/analytics/track';

/**
 * Un seul écouteur délégué au niveau du document, monté une fois dans le
 * layout racine, plutôt qu'un composant à envelopper autour de chaque
 * `<Link>` : il suffit d'ajouter `data-track-link`/`data-track-label` sur un
 * lien existant pour qu'il soit suivi.
 */
export function LinkClickTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLElement>('[data-track-link]');
      if (!link) return;

      const id = link.getAttribute('data-track-link');
      if (!id) return;

      const label = link.getAttribute('data-track-label') ?? link.textContent?.trim() ?? id;
      const href = link.getAttribute('href') ?? '';

      trackLinkClick(window.location.pathname, id, label, href);
    }

    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
