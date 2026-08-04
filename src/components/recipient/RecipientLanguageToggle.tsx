'use client';

import { setLang, useLang } from '@/lib/i18n/language';

/**
 * Même bascule que le site vitrine, mais en couleurs `--theme-*` : le
 * parcours destinataire ne consomme jamais les tokens crème/bordeaux du
 * site, il aurait juré sur un thème sombre (« Nuit ») avec les couleurs
 * du composant d'origine.
 */
export function RecipientLanguageToggle() {
  const lang = useLang();
  const next = lang === 'fr' ? 'en' : 'fr';

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
      title={lang === 'fr' ? 'English' : 'Français'}
      className="fixed right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition"
      style={{
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-muted)',
        background: 'var(--theme-surface)',
      }}
    >
      {next.toUpperCase()}
    </button>
  );
}
