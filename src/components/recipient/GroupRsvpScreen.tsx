'use client';

import { motion } from 'framer-motion';

import { StepHeader } from '@/components/recipient/StepHeader';
import type { PublicProposal } from '@/components/recipient/types';
import type { AnyProposalType } from '@/lib/domain/proposal';
import { useT } from '@/lib/i18n/use-t';
import { useTypeMeta } from '@/lib/i18n/type-meta';
import { EASE_OUT_EXPO } from '@/lib/motion';

/**
 * Écran de groupe : pas de bouton « Non » fuyant, le ton ludique de l'écran
 * individuel ne correspond pas à un afterwork ou une sortie entre collègues.
 * Va droit au but — places restantes, un bouton, direction le choix du
 * lieu et du créneau.
 */
export function GroupRsvpScreen({
  recipientName,
  type,
  group,
  onJoin,
}: {
  recipientName: string;
  type: AnyProposalType;
  group: NonNullable<PublicProposal['group']>;
  onJoin: () => void;
}) {
  const t = useT();
  const typeMeta = useTypeMeta();
  const meta = typeMeta(type);

  const remaining = Math.max(0, group.capacity - group.confirmedCount);
  const full = remaining === 0;

  return (
    <motion.div
      key="group-rsvp"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      className="flex min-h-dvh flex-col items-center justify-center px-5 py-12"
    >
      <div className="w-full max-w-md text-center">
        {/* Le nom du groupe tient lieu de surtitre : c'est lui qui identifie
            l'invitation, avant même le titre générique. */}
        <StepHeader
          eyebrow={recipientName}
          title={full ? t.recipient.group.titleFull : t.recipient.group.title}
          icon={meta.emoji}
          delay={0.1}
        >
          {full
            ? t.recipient.group.bodyFull
            : t.recipient.group.remaining(remaining, group.capacity)}
        </StepHeader>

        <motion.button
          type="button"
          onClick={onJoin}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-8 w-full rounded-full px-8 py-4 text-lg font-medium shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition active:scale-[0.99]"
          style={{
            background: 'var(--theme-accent)',
            color: 'var(--theme-accent-ink)',
          }}
        >
          {full ? t.recipient.group.joinFull : t.recipient.group.join}
        </motion.button>
      </div>
    </motion.div>
  );
}
