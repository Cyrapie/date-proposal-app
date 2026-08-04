/**
 * Thèmes visuels du parcours destinataire.
 *
 * Les couleurs elles-mêmes vivent dans `globals.css`, pas ici : chaque thème
 * y a deux jeux de variables (`[data-theme="x"]` et `.dark [data-theme="x"]`),
 * posés en CSS pur plutôt qu'en style inline calculé en JS. Un style inline
 * gagnerait toujours contre une règle `.dark` sur la même propriété — la
 * bascule sombre n'aurait jamais pu s'appliquer autrement.
 */

export const THEMES = ['classic', 'fun', 'midnight'] as const;
export type Theme = (typeof THEMES)[number];

export function isTheme(value: string): value is Theme {
  return (THEMES as readonly string[]).includes(value);
}
