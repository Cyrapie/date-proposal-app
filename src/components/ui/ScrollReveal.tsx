'use client';

import { useEffect } from 'react';

/**
 * Apparition des blocs au défilement.
 *
 * Monté une seule fois dans le layout vitrine, il observe tous les éléments
 * portant `data-reveal` — y compris ceux ajoutés plus tard par une navigation
 * client, d'où le `MutationObserver`. Le marquage par attribut évite d'envelopper
 * chaque bloc dans un composant supplémentaire, et laisse les pages rester des
 * composants serveur.
 *
 * Le masquage initial est conditionné à la classe `js-reveal` posée ici : sans
 * JavaScript, ou si ce composant ne monte pas, le contenu reste simplement
 * visible plutôt que de disparaître définitivement.
 *
 * Décalage en cascade : `--reveal-delay` sur l'élément, posé par l'appelant.
 */
export function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;

    // Mouvement réduit demandé : on révèle tout d'emblée, sans observer.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') return;

    root.classList.add('js-reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('revele');
          // Une seule fois : le bloc ne doit pas se re-masquer en remontant.
          observer.unobserve(entry.target);
        }
      },
      // Déclenche un peu avant le bas de l'écran, pour que le bloc soit déjà
      // en place quand il arrive vraiment dans le champ de lecture.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    const observe = (node: ParentNode) => {
      for (const element of node.querySelectorAll('[data-reveal]:not(.revele)')) {
        observer.observe(element);
      }
    };

    observe(document);

    // Navigation client : le DOM change sans remontage de ce composant.
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const element = node as Element;
          if (element.matches('[data-reveal]')) observer.observe(element);
          observe(element);
        }
      }
    });

    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      root.classList.remove('js-reveal');
    };
  }, []);

  return null;
}
