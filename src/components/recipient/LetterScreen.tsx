'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

import { PROPOSAL_TYPE_META } from '@/lib/domain/proposal';
import type { PublicProposal } from '@/components/recipient/types';
import { EASE_OUT_EXPO } from '@/lib/motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
};

export function LetterScreen({
  proposal,
  onContinue,
}: {
  proposal: PublicProposal;
  onContinue: () => void;
}) {
  const meta = PROPOSAL_TYPE_META[proposal.type];

  return (
    <motion.div
      key="letter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      className="flex min-h-dvh flex-col items-center justify-center px-5 py-12"
    >
      <motion.article
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md rounded-[var(--radius-card)] border p-7 shadow-[0_20px_50px_rgba(0,0,0,0.07)] sm:p-9"
        style={{
          background: 'var(--theme-surface)',
          borderColor: 'var(--theme-border)',
        }}
      >
        <motion.p
          variants={item}
          className="text-xs uppercase tracking-[0.18em]"
          style={{ color: 'var(--theme-muted)' }}
        >
          C&apos;est noté
        </motion.p>

        <motion.h1
          variants={item}
          className="mt-3 font-serif text-3xl leading-tight sm:text-4xl"
          style={{ color: 'var(--theme-accent)' }}
        >
          {meta.headline} <span aria-hidden="true">{meta.emoji}</span>
        </motion.h1>

        {proposal.photoUrl ? (
          <motion.div
            variants={item}
            className="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded-2xl"
            style={{ background: 'var(--theme-accent-soft)' }}
          >
            <Image
              src={proposal.photoUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 448px"
              className="object-cover"
              unoptimized
            />
          </motion.div>
        ) : null}

        {proposal.message ? (
          <motion.p
            variants={item}
            className="mt-6 whitespace-pre-line font-serif text-lg leading-relaxed"
            style={{ color: 'var(--theme-ink)' }}
          >
            {proposal.message}
          </motion.p>
        ) : null}

        <motion.div variants={item} className="mt-8">
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-full px-6 py-3.5 text-base font-medium transition active:scale-[0.99]"
            style={{
              background: 'var(--theme-accent)',
              color: 'var(--theme-accent-ink)',
            }}
          >
            Continuer
          </button>
        </motion.div>
      </motion.article>
    </motion.div>
  );
}
