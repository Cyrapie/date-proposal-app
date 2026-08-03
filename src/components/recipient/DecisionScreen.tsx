'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useState } from 'react';

import { NoButton } from '@/components/recipient/NoButton';
import { StepHeader } from '@/components/recipient/StepHeader';
import type { AnyProposalType } from '@/lib/domain/proposal';
import { useT } from '@/lib/i18n/use-t';
import { useTypeMeta } from '@/lib/i18n/type-meta';
import { EASE_OUT_EXPO } from '@/lib/motion';

export function DecisionScreen({
  recipientName,
  type,
  onYes,
}: {
  recipientName: string;
  type: AnyProposalType;
  onYes: () => void;
}) {
  const t = useT();
  const typeMeta = useTypeMeta();
  const meta = typeMeta(type);

  const [tease, setTease] = useState<string | null>(null);
  const [teaseKey, setTeaseKey] = useState(0);

  const handleTease = useCallback((message: string) => {
    setTease(message);
    setTeaseKey((key) => key + 1);
  }, []);

  return (
    <motion.div
      key="decision"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      className="flex min-h-dvh flex-col items-center justify-center px-5 py-12"
    >
      <div className="w-full max-w-md text-center">
        <StepHeader
          eyebrow={t.recipient.decision.eyebrow(recipientName)}
          title={t.recipient.decision.title}
          icon={meta.emoji}
          delay={0.15}
        />

        {/* Message de taquinerie : réservé en hauteur pour éviter tout saut. */}
        <div className="mt-8 flex h-7 items-center justify-center" aria-live="polite">
          <AnimatePresence mode="wait">
            {tease ? (
              <motion.span
                key={teaseKey}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.22 }}
                className="font-serif text-lg italic"
                style={{ color: 'var(--theme-muted)' }}
              >
                {tease}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mt-3"
        >
          {/* Le « Oui » reste immobile et cliquable à tout moment. */}
          <button
            type="button"
            onClick={onYes}
            className="w-full rounded-full px-8 py-4 text-lg font-medium shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition active:scale-[0.99]"
            style={{
              background: 'var(--theme-accent)',
              color: 'var(--theme-accent-ink)',
            }}
          >
            {t.recipient.decision.yes}
          </button>

          <NoButton
            label={t.recipient.decision.no}
            messages={t.recipient.decision.tease}
            onTease={handleTease}
            className="mt-2"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
