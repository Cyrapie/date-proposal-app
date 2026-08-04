'use client';

import { useEffect, useState } from 'react';

import { StepHeader } from '@/components/recipient/StepHeader';
import { useT } from '@/lib/i18n/use-t';

/** Lien d'annulation incomplet : ni identifiant de réponse, ni jeton. */
export function InvalidLinkNotice() {
  const t = useT();

  return (
    <p className="max-w-sm text-center text-sm" style={{ color: 'var(--theme-muted)' }}>
      {t.recipient.cancel.invalidLink}
    </p>
  );
}

/**
 * Confirmation d'annulation d'une place de groupe. Porte aussi l'en-tête de la
 * page : celle-ci est rendue côté serveur et ne peut pas lire la langue, qui
 * n'existe que dans le navigateur.
 */
export function CancelForm({
  slug,
  responseId,
  token,
  groupName,
}: {
  slug: string;
  responseId: string;
  token: string;
  groupName: string;
}) {
  const t = useT();
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  // Le titre statique posé côté serveur ne peut pas suivre la langue,
  // inconnue à ce stade du rendu. Délai de 50 ms : l'App Router réaffirme le
  // titre du layout après le premier rendu sur un tick que `setTimeout(fn, 0)`
  // ne suffit pas à dépasser (vérifié).
  useEffect(() => {
    const id = window.setTimeout(() => {
      document.title = `${t.recipient.cancel.title} · Keerelle`;
    }, 50);
    return () => window.clearTimeout(id);
  }, [t]);

  async function handleCancel() {
    setStatus('sending');
    try {
      const res = await fetch(`/api/d/${slug}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ r: responseId, t: token }),
      });

      if (!res.ok) throw new Error();
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="w-full max-w-sm">
      <StepHeader eyebrow={groupName} title={t.recipient.cancel.title}>
        {t.recipient.cancel.body}
      </StepHeader>

      <div className="mt-7">
        {status === 'done' ? (
          <p
            className="rounded-2xl border p-4 text-sm"
            style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-muted)' }}
          >
            {t.recipient.cancel.done}
          </p>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={status === 'sending'}
              className="w-full rounded-full px-6 py-3.5 text-base font-medium transition active:scale-[0.99] disabled:opacity-60"
              style={{ background: 'var(--theme-accent)', color: 'var(--theme-accent-ink)' }}
            >
              {status === 'sending' ? t.recipient.cancel.cancelling : t.recipient.cancel.confirm}
            </button>

            {status === 'error' ? (
              <p role="alert" className="text-center text-sm" style={{ color: 'var(--theme-accent)' }}>
                {t.recipient.cancel.error}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
