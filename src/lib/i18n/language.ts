'use client';

import { useSyncExternalStore } from 'react';

export type Lang = 'fr' | 'en';

export const LANG_STORAGE_KEY = 'invitation-lang';
const LANG_EVENT = 'invitation-lang-change';

/**
 * Script injecté avant le premier rendu, sur le même principe que
 * `themeBootScript` : pose `lang` et `data-lang` sur <html> d'après la
 * préférence stockée, ou la langue du navigateur à la première visite.
 */
export const languageBootScript = `(function(){try{var k=${JSON.stringify(LANG_STORAGE_KEY)};var s=localStorage.getItem(k);var l=s==='en'||s==='fr'?s:((navigator.language||'').toLowerCase().startsWith('en')?'en':'fr');document.documentElement.lang=l;document.documentElement.setAttribute('data-lang',l);}catch(e){}})();`;

/**
 * La langue courante vit dans le DOM (`data-lang` sur <html>), posée par le
 * script ci-dessus avant même React. On s'y abonne plutôt que de la dupliquer
 * dans un état local, ce qui déclencherait un rendu en cascade au montage.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(LANG_EVENT, onChange);
  return () => window.removeEventListener(LANG_EVENT, onChange);
}

function getSnapshot(): Lang {
  return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'fr';
}

/** Le serveur ne connaît pas la préférence : il rend toujours en français. */
function getServerSnapshot(): Lang {
  return 'fr';
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setLang(next: Lang) {
  document.documentElement.lang = next;
  document.documentElement.setAttribute('data-lang', next);
  try {
    localStorage.setItem(LANG_STORAGE_KEY, next);
  } catch {
    // Navigation privée ou stockage refusé : la bascule reste valable pour la
    // session en cours.
  }
  window.dispatchEvent(new Event(LANG_EVENT));
}
