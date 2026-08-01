'use client';

import { useEffect, useState } from 'react';

export function CopyLinkButton({ url, className }: { url: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Contexte non sécurisé ou permission refusée : on montre le lien brut
      // pour que l'utilisateur puisse le sélectionner à la main.
      window.prompt('Copiez le lien :', url);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-ink transition hover:bg-accent-hover active:scale-[0.98] ${className ?? ''}`}
    >
      {copied ? 'Lien copié ✓' : 'Copier le lien'}
    </button>
  );
}
