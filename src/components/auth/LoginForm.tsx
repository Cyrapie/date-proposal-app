'use client';

import { useState, type FormEvent } from 'react';

import { Field, inputClass } from '@/components/ui/Field';
import { useT } from '@/lib/i18n/use-t';
import { createClient } from '@/lib/supabase/client';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const t = useT();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setError(null);

    try {
      const supabase = createClient();
      const redirectTo = new URL('/auth/callback', window.location.origin);
      if (nextPath) {
        redirectTo.searchParams.set('next', nextPath);
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo.toString() },
      });

      if (signInError) throw signInError;
      setStatus('sent');
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : t.authForm.sendError);
    }
  }

  if (status === 'sent') {
    return (
      <div role="status" className="bloc p-6 text-center">
        <p className="font-serif text-xl font-bold text-ink-900">{t.authForm.sentTitle}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-400">{t.authForm.sentBody(email)}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 text-xs text-ink-400 underline underline-offset-4 hover:text-ink-600"
        >
          {t.authForm.sentRetry}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label={t.authForm.emailLabel} htmlFor="email" required error={error ?? undefined}>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t.authForm.emailPlaceholder}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={status === 'sending' || email.trim().length === 0}
        className="w-full rounded-full bg-accent px-6 py-3.5 text-base font-medium text-accent-ink transition active:scale-[0.99] hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'sending' ? t.authForm.submitting : t.authForm.submit}
      </button>

      <p className="text-center text-xs leading-relaxed text-ink-400">{t.authForm.privacyNote}</p>
    </form>
  );
}
