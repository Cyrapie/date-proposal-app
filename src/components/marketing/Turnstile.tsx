'use client';

import Script from 'next/script';
import { useEffect, useId, useRef, useState } from 'react';

import { useLang } from '@/lib/i18n/language';

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          language?: string;
        },
      ) => string;
      remove: (id: string) => void;
    };
  }
}

/**
 * Widget Cloudflare Turnstile.
 *
 * Sans `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, le composant ne rend rien et ne
 * charge aucun script tiers. Le serveur, de son côté, neutralise aussi la
 * vérification : le formulaire reste utilisable.
 */
export function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const lang = useLang();
  const conteneur = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [pret, setPret] = useState(false);
  const domId = useId();

  useEffect(() => {
    if (!siteKey || !pret || !conteneur.current || widgetId.current) return;
    if (!window.turnstile) return;

    widgetId.current = window.turnstile.render(conteneur.current, {
      sitekey: siteKey,
      callback: (token) => onToken(token),
      'expired-callback': () => onToken(null),
      'error-callback': () => onToken(null),
      theme: 'auto',
      language: lang,
    });

    const id = widgetId.current;
    return () => {
      if (id) window.turnstile?.remove(id);
      widgetId.current = null;
    };
  }, [siteKey, pret, onToken, lang]);

  if (!siteKey) return null;

  return (
    <div className="space-y-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onReady={() => setPret(true)}
      />
      <div ref={conteneur} id={domId} />
    </div>
  );
}
