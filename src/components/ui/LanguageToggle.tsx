'use client';

import { setLang, useLang } from '@/lib/i18n/language';

export function LanguageToggle({ className }: { className?: string }) {
  const lang = useLang();
  const suivant = lang === 'fr' ? 'en' : 'fr';

  return (
    <button
      type="button"
      onClick={() => setLang(suivant)}
      aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
      title={lang === 'fr' ? 'English' : 'Français'}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 text-xs font-bold text-ink-600 transition hover:border-bordeaux-500 hover:text-bordeaux-500 ${className ?? ''}`}
    >
      {suivant.toUpperCase()}
    </button>
  );
}
