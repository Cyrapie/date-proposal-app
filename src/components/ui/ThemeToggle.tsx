'use client';

import { useSyncExternalStore } from 'react';

export type Mode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'invitation-theme';
const THEME_EVENT = 'invitation-theme-change';

/**
 * Script injecté avant le premier rendu pour poser `.dark` sur <html>.
 * Sans lui, la page s'affiche brièvement en clair avant de basculer.
 */
export const themeBootScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

/**
 * Le mode courant vit dans le DOM (`.dark` sur <html>), posé par le script
 * ci-dessus avant même React. On s'y abonne plutôt que de le dupliquer dans
 * un état local, ce qui éviterait mal un rendu en cascade au montage.
 */
function subscribe(onChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  window.addEventListener(THEME_EVENT, onChange);
  media.addEventListener('change', onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    media.removeEventListener('change', onChange);
  };
}

function getSnapshot(): Mode {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/** Le serveur ne connaît pas la préférence : on rend l'icône neutre. */
function getServerSnapshot(): Mode {
  return 'light';
}

export function ThemeToggle({ className }: { className?: string }) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const sombre = mode === 'dark';

  function basculer() {
    const suivant: Mode = sombre ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', suivant === 'dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, suivant);
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
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 text-ink-600 transition hover:border-bordeaux-500 hover:text-bordeaux-500 ${className ?? ''}`}
    >
      {sombre ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path
            d="M12 2.6v2.2M12 19.2v2.2M4.4 12H2.2M21.8 12h-2.2M6.3 6.3 4.8 4.8M19.2 19.2l-1.5-1.5M17.7 6.3l1.5-1.5M4.8 19.2l1.5-1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
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
