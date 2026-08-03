'use client';

import { motion } from 'framer-motion';

import { StepHeader } from '@/components/recipient/StepHeader';
import type { ConfirmedResponse } from '@/components/recipient/types';
import type { AnyProposalType } from '@/lib/domain/proposal';
import { formatSlotRangeIn } from '@/lib/format';
import { useLang } from '@/lib/i18n/language';
import { useT } from '@/lib/i18n/use-t';
import { useTypeMeta } from '@/lib/i18n/type-meta';
import { EASE_OUT_EXPO } from '@/lib/motion';

export function ConfirmationScreen({
  response,
  type,
}: {
  response: ConfirmedResponse;
  type: AnyProposalType;
}) {
  const t = useT();
  const lang = useLang();
  const typeMeta = useTypeMeta();
  const meta = typeMeta(type);

  const waitlisted = response.group?.status === 'waitlisted';

  const title = waitlisted
    ? t.recipient.confirmation.titleWaitlisted
    : response.countered
      ? t.recipient.confirmation.titleCountered
      : t.recipient.confirmation.title;

  return (
    <motion.div
      key="confirmation"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      className="flex min-h-dvh flex-col items-center justify-center px-5 py-12"
    >
      <div className="w-full max-w-md">
        <StepHeader eyebrow={t.recipient.confirmation.eyebrow} title={title} icon={meta.emoji} delay={0.1}>
          {waitlisted
            ? t.recipient.confirmation.waitlistBody(response.group?.waitlistPosition ?? null)
            : null}
        </StepHeader>

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
                {response.countered
                  ? t.recipient.confirmation.whenCountered
                  : t.recipient.confirmation.when}
              </dt>
              <dd className="mt-1 font-serif text-lg">
                {formatSlotRangeIn(response.slot.start, response.slot.end, lang)}
              </dd>
            </div>

            {response.location ? (
              <div>
                <dt
                  className="text-xs uppercase tracking-[0.14em]"
                  style={{ color: 'var(--theme-muted)' }}
                >
                  {t.recipient.confirmation.where}
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
                      {t.recipient.confirmation.mapLink}
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
                  {t.recipient.confirmation.yourNote}
                </dt>
                <dd className="mt-1 font-serif text-lg italic">« {response.note} »</dd>
              </div>
            ) : null}
          </dl>
        </motion.div>

        {waitlisted ? null : (
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
              {t.recipient.confirmation.addToCalendar}
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
              {t.recipient.confirmation.openGoogle}
            </a>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-8 text-center text-sm"
          style={{ color: 'var(--theme-muted)' }}
        >
          {response.countered
            ? t.recipient.confirmation.footerCountered
            : t.recipient.confirmation.footer}
        </motion.p>
      </div>
    </motion.div>
  );
}
