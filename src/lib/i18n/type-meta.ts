'use client';

import { anyTypeMeta, type AnyProposalType } from '@/lib/domain/proposal';
import { useT } from '@/lib/i18n/use-t';

export type DisplayTypeMeta = {
  /** Libellé court, pour les sélecteurs du formulaire. */
  label: string;
  /** Titre affiché au destinataire sur la lettre. */
  headline: string;
  emoji: string;
};

/**
 * Résout les métadonnées d'affichage d'une occasion.
 *
 * Renvoie une fonction plutôt que le résultat direct : les sélecteurs du
 * formulaire en ont besoin pour une liste entière de types, ce qu'un hook
 * appelé dans une boucle ne permettrait pas.
 *
 * Le libellé et le titre viennent du dictionnaire, l'emoji du domaine : il est
 * le même dans les deux langues, et reste ainsi aligné avec ce qu'utilisent les
 * emails et le calendrier, rendus côté serveur.
 */
export function useTypeMeta(): (type: AnyProposalType) => DisplayTypeMeta {
  const t = useT();

  return (type) => ({
    ...t.typeMeta[type],
    emoji: anyTypeMeta(type).emoji,
  });
}
