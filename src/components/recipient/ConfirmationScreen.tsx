'use client';

import { motion } from 'framer-motion';

import { Heart } from '@/components/ui/Heart';
import { formatSlotRange } from '@/lib/format';
import type { ConfirmedResponse } from '@/components/recipient/types';
import { EASE_OUT_EXPO } from '@/lib/motion';

export function ConfirmationScreen({ response }: { response: ConfirmedResponse }) {
  return (
    <motion.div
      key="confirmation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      className="flex min-h-dvh flex-col items-center justify-center px-5 py-12"
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 240, damping: 16 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'var(--theme-accent)' }}
        >
          <Heart className="h-7 w-7" fill="var(--theme-accent-ink)" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="text-center font-serif text-4xl leading-tight"
          style={{ color: 'var(--theme-accent)' }}
        >
          {response.countered ? 'Bien reçu' : 'Parfait'}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 rounded-[var(--radius-card)] border p-6"
          style={{
            background: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <dl className="space-y-4 text-left">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--theme-muted)' }}>
                {response.countered ? 'Votre proposition' : 'Quand'}
              </dt>
              <dd className="mt-1 font-serif text-lg">
                {formatSlotRange(response.slot.start, response.slot.end)}
              </dd>
            </div>

            {response.location ? (
              <div>
                <dt
                  className="text-xs uppercase tracking-[0.14em]"
                  style={{ color: 'var(--theme-muted)' }}
                >
                  Où
                </dt>
                <dd className="mt-1 font-serif text-lg">
                  {response.location.label}
                  {response.location.address ? (
                    <span className="mt-0.5 block font-sans text-sm" style={{ color: 'var(--theme-muted)' }}>
                      {response.location.address}
                    </span>
                  ) : null}
                  {response.location.mapUrl ? (
                    <a
                      href={response.location.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block font-sans text-xs underline underline-offset-4"
                      style={{ color: 'var(--theme-accent)' }}
                    >
                      Voir sur la carte
                    </a>
                  ) : null}
                </dd>
              </div>
            ) : null}

            {response.note ? (
              <div>
                <dt
                  className="text-xs uppercase tracking-[0.14em]"
                  style={{ color: 'var(--theme-muted)' }}
                >
                  Ton mot
                </dt>
                <dd className="mt-1 font-serif text-lg italic">« {response.note} »</dd>
              </div>
            ) : null}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-6 space-y-3"
        >
          <a
            href={response.icsUrl}
            download
            className="block w-full rounded-full px-6 py-4 text-center text-base font-medium transition active:scale-[0.99]"
            style={{
              background: 'var(--theme-accent)',
              color: 'var(--theme-accent-ink)',
            }}
          >
            Ajouter à mon calendrier
          </a>

          <a
            href={response.googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-full border px-6 py-3.5 text-center text-sm font-medium transition active:scale-[0.99]"
            style={{
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-muted)',
            }}
          >
            Ouvrir dans Google Calendar
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 text-center text-sm"
          style={{ color: 'var(--theme-muted)' }}
        >
          {response.countered
            ? 'Votre proposition est transmise. Vous recevrez une confirmation.'
            : "C'est envoyé. À très vite."}
        </motion.p>
      </div>
    </motion.div>
  );
}
