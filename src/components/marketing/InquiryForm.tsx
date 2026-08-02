'use client';

import { useCallback, useState, type FormEvent } from 'react';

import { MarketingField, marketingInputClass } from '@/components/marketing/MarketingField';
import { Turnstile } from '@/components/marketing/Turnstile';
import { useT } from '@/lib/i18n/use-t';
import type { InquiryKind } from '@/lib/validation/inquiry';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function InquiryForm({
  kind,
  messageLabel,
  messagePlaceholder,
  submitLabel,
}: {
  kind: InquiryKind;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
}) {
  const t = useT();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // piège à robots
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Référence stable : sans cela le widget se remonterait à chaque frappe.
  const handleToken = useCallback((token: string | null) => setTurnstileToken(token), []);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setError(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind, name, email, company, message, website,
          turnstileToken: turnstileToken ?? '',
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? t.inquiryForm.genericError);

      setStatus('sent');
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : t.inquiryForm.genericError);
    }
  }

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-card)] border border-cream-300 bg-cream-50 p-8 text-center"
      >
        <p className="font-serif text-2xl font-extrabold text-bordeaux-600">{t.inquiryForm.sentTitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-400">
          {t.inquiryForm.sentBody(name.split(' ')[0] || '', email)}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <MarketingField label={t.inquiryForm.nameLabel} htmlFor="name" required>
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={120}
          autoComplete="name"
          className={marketingInputClass}
        />
      </MarketingField>

      <MarketingField label={t.inquiryForm.emailLabel} htmlFor="email" required>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          maxLength={200}
          className={marketingInputClass}
        />
      </MarketingField>

      {kind === 'partner' ? (
        <MarketingField label={t.inquiryForm.companyLabel} htmlFor="company" hint={t.inquiryForm.companyHint}>
          <input
            id="company"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            maxLength={160}
            autoComplete="organization"
            className={marketingInputClass}
          />
        </MarketingField>
      ) : null}

      <MarketingField label={messageLabel} htmlFor="message" required>
        <textarea
          id="message"
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          minLength={10}
          maxLength={4000}
          placeholder={messagePlaceholder}
          className={`${marketingInputClass} resize-none`}
        />
      </MarketingField>

      {/* Piège à robots : invisible et hors du parcours clavier. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">{t.inquiryForm.robotTrapLabel}</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <Turnstile onToken={handleToken} />

      {error ? (
        <p role="alert" className="rounded-xl bg-bordeaux-50 p-4 text-sm text-bordeaux-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-full bg-accent px-6 py-4 text-base font-medium text-accent-ink transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {status === 'sending' ? t.inquiryForm.sending : submitLabel}
      </button>

      <p className="text-xs leading-relaxed text-ink-400">{t.inquiryForm.privacyNote}</p>
    </form>
  );
}
