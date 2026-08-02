'use client';

import { useState } from 'react';

export function CancelForm({
  slug,
  responseId,
  token,
}: {
  slug: string;
  responseId: string;
  token: string;
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

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

  if (status === 'done') {
    return (
      <p className="rounded-2xl border p-4 text-sm" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-muted)' }}>
        Votre place est annulée. Merci de nous avoir prévenus.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleCancel}
        disabled={status === 'sending'}
        className="w-full rounded-full px-6 py-3.5 text-base font-medium transition active:scale-[0.99] disabled:opacity-60"
        style={{ background: 'var(--theme-accent)', color: 'var(--theme-accent-ink)' }}
      >
        {status === 'sending' ? 'Annulation…' : 'Confirmer l’annulation'}
      </button>

      {status === 'error' ? (
        <p role="alert" className="text-center text-sm" style={{ color: 'var(--theme-accent)' }}>
          Ce lien n’est plus valide, ou votre place a déjà été annulée.
        </p>
      ) : null}
    </div>
  );
}
