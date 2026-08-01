/**
 * Thèmes visuels du parcours destinataire.
 * Chaque thème expose ses couleurs sous forme de variables CSS appliquées
 * en inline style sur le conteneur racine du parcours.
 */

export const THEMES = ['classic', 'fun', 'midnight'] as const;
export type Theme = (typeof THEMES)[number];

export type ThemeTokens = {
  '--theme-bg': string;
  '--theme-surface': string;
  '--theme-ink': string;
  '--theme-muted': string;
  '--theme-accent': string;
  '--theme-accent-soft': string;
  '--theme-accent-ink': string;
  '--theme-border': string;
};

type ThemeMeta = {
  label: string;
  description: string;
  tokens: ThemeTokens;
};

export const THEME_META: Record<Theme, ThemeMeta> = {
  classic: {
    label: 'Classique',
    description: 'Crème et bordeaux profond, esprit papier à lettres.',
    tokens: {
      '--theme-bg': '#faf6f0',
      '--theme-surface': '#fffdf9',
      '--theme-ink': '#2a2320',
      '--theme-muted': '#7d6f66',
      '--theme-accent': '#6d1b2c',
      '--theme-accent-soft': '#f2e3e5',
      '--theme-accent-ink': '#fffdf9',
      '--theme-border': '#e6dbcd',
    },
  },
  fun: {
    label: 'Coloré',
    description: 'Pêche et framboise, plus vif et joueur.',
    tokens: {
      '--theme-bg': '#fff4ec',
      '--theme-surface': '#fffaf6',
      '--theme-ink': '#3b1f2b',
      '--theme-muted': '#8a6072',
      '--theme-accent': '#d6336c',
      '--theme-accent-soft': '#ffe0ec',
      '--theme-accent-ink': '#fffaf6',
      '--theme-border': '#ffd9c4',
    },
  },
  midnight: {
    label: 'Nuit',
    description: 'Bleu nuit et or doux, pour les invitations du soir.',
    tokens: {
      '--theme-bg': '#151a2d',
      '--theme-surface': '#1e2540',
      '--theme-ink': '#f3efe7',
      '--theme-muted': '#a7aec7',
      '--theme-accent': '#c9a227',
      '--theme-accent-soft': '#2b3357',
      '--theme-accent-ink': '#151a2d',
      '--theme-border': '#333c63',
    },
  },
};

export function isTheme(value: string): value is Theme {
  return (THEMES as readonly string[]).includes(value);
}

export function themeStyle(theme: Theme): React.CSSProperties {
  return THEME_META[theme].tokens as unknown as React.CSSProperties;
}
