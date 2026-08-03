'use client';

import { motion } from 'framer-motion';

import { StepHeader } from '@/components/recipient/StepHeader';
import type { AnyProposalType } from '@/lib/domain/proposal';
import { useT } from '@/lib/i18n/use-t';
import { useTypeMeta } from '@/lib/i18n/type-meta';
import { EASE_OUT_EXPO } from '@/lib/motion';

export function EnvelopeScreen({
  recipientName,
  type,
  onOpen,
}: {
  recipientName: string;
  type: AnyProposalType;
  onOpen: () => void;
}) {
  const t = useT();
  const typeMeta = useTypeMeta();
  const meta = typeMeta(type);

  return (
    <motion.div
      key="envelope"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-dvh flex-col items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-md">
        <StepHeader eyebrow={t.recipient.envelope.eyebrow(recipientName)} title={t.recipient.envelope.title} />
      </div>

      <motion.button
        type="button"
        onClick={onOpen}
        aria-label={t.recipient.envelope.openAria}
        className="group relative mt-10 outline-none"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.6, ease: EASE_OUT_EXPO }}
        whileTap={{ scale: 0.96 }}
      >
        {/* Respiration douce pour inviter au tap */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <svg
            viewBox="0 0 200 132"
            className="h-auto w-[min(76vw,300px)] drop-shadow-[0_18px_36px_rgba(0,0,0,0.10)]"
            aria-hidden="true"
          >
            <rect
              x="2"
              y="2"
              width="196"
              height="128"
              rx="10"
              fill="var(--theme-surface)"
              stroke="var(--theme-border)"
              strokeWidth="2"
            />
            {/* Rabat fermé */}
            <path
              d="M2 12 L100 76 L198 12"
              fill="none"
              stroke="var(--theme-border)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M2 122 L74 68 M198 122 L126 68"
              fill="none"
              stroke="var(--theme-border)"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>

          {/* Sceau : porte l'emoji de l'occasion plutôt qu'un cœur générique,
              qui ne conviendrait ni à un afterwork ni à une sortie de club. */}
          <motion.div
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-2xl shadow-lg"
            style={{ background: 'var(--theme-accent)' }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            {meta.emoji}
          </motion.div>
        </motion.div>
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="mt-10 font-serif text-xl tracking-wide"
        style={{ color: 'var(--theme-muted)' }}
      >
        {t.recipient.envelope.hint}
      </motion.p>
    </motion.div>
  );
}
