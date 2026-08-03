'use client';

import { themeStyle, type Theme } from '@/lib/domain/themes';
import { useT } from '@/lib/i18n/use-t';

export function ExpiredLink({ theme }: { theme: Theme }) {
  const t = useT();

  return (
    <main
      className="themed flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center"
      style={themeStyle(theme)}
    >
      <div className="max-w-sm">
        <p className="font-serif text-5xl" aria-hidden="true">
          🕰️
        </p>
        <p
          className="mt-6 text-xs uppercase tracking-[0.18em]"
          style={{ color: 'var(--theme-muted)' }}
        >
          {t.recipient.expired.eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-3xl" style={{ color: 'var(--theme-accent)' }}>
          {t.recipient.expired.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--theme-muted)' }}>
          {t.recipient.expired.body}
        </p>
      </div>
    </main>
  );
}
