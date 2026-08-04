'use client';

import { useSyncExternalStore } from 'react';

import { THEME_STORAGE_KEY } from '@/components/ui/ThemeToggle';

const THEME_EVENT = 'invitation-theme-change';

function subscribe(onChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  window.addEventListener(THEME_EVENT, onChange);
  media.addEventListener('change', onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    media.removeEventListener('change', onChange);
  };
}

function getSnapshot(): boolean {
  return document.documentElement.classList.contains('dark');
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Même bascule clair/sombre que le site, en couleurs `--theme-*` — voir
 * `RecipientLanguageToggle` pour la même remarque sur les tokens crème/bordeaux
 * du composant d'origine, inadaptés ici.
 *
 * Chaque thème (Classique/Coloré/Nuit) a sa propre déclinaison sombre en CSS
 * (`globals.css`), posée automatiquement dès que `.dark` est sur `<html>` —
 * ce bouton ne fait que basculer cette classe, comme `ThemeToggle`.
 */
export function RecipientThemeToggle() {
  const sombre = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function basculer() {
    const suivant = !sombre;
    document.documentElement.classList.toggle('dark', suivant);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, suivant ? 'dark' : 'light');
    } catch {
      // Navigation privée ou stockage refusé : la bascule reste valable pour
      // la session en cours.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      onClick={basculer}
      aria-label={sombre ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={sombre ? 'Mode clair' : 'Mode sombre'}
      className="fixed right-16 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border transition"
      style={{
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-muted)',
        background: 'var(--theme-surface)',
      }}
    >
      {sombre ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path
            d="M12 2.6v2.2M12 19.2v2.2M4.4 12H2.2M21.8 12h-2.2M6.3 6.3 4.8 4.8M19.2 19.2l-1.5-1.5M17.7 6.3l1.5-1.5M4.8 19.2l1.5-1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path
            d="M20.5 14.2A8.4 8.4 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
