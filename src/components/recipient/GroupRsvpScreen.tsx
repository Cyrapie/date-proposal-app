'use client';

import { motion } from 'framer-motion';

import { Heart } from '@/components/ui/Heart';
import type { PublicProposal } from '@/components/recipient/types';
import { EASE_OUT_EXPO } from '@/lib/motion';

/**
 * Écran de groupe : pas de bouton « Non » fuyant, le ton ludique de l'écran
 * individuel ne correspond pas à un afterwork ou une sortie entre collègues.
 * Va droit au but — places restantes, un bouton, direction le choix du
 * lieu et du créneau.
 */
export function GroupRsvpScreen({
  recipientName,
  group,
  onJoin,
}: {
  recipientName: string;
  group: NonNullable<PublicProposal['group']>;
  onJoin: () => void;
}) {
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
        <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--theme-muted)' }}>
          {recipientName}
        </p>

        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
          className="mt-5 flex justify-center"
        >
          <Heart className="h-9 w-9" fill="var(--theme-accent)" />
        </motion.div>

        <h1
          className="mt-6 font-serif text-3xl leading-tight sm:text-4xl"
          style={{ color: 'var(--theme-accent)' }}
        >
          {full ? "C'est complet — rejoignez la liste d'attente" : 'Vous êtes invité'}
        </h1>

        <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--theme-muted)' }}>
          {full
            ? "Toutes les places sont prises, mais vous pouvez rejoindre la liste d'attente : vous serez prévenu automatiquement si une place se libère."
            : `${remaining} place${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''} sur ${group.capacity}.`}
        </p>

        <button
          type="button"
          onClick={onJoin}
          className="mt-8 w-full rounded-full px-8 py-4 text-lg font-medium shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition active:scale-[0.99]"
          style={{
            background: 'var(--theme-accent)',
            color: 'var(--theme-accent-ink)',
          }}
        >
          {full ? "Rejoindre la liste d'attente" : 'Je participe'}
        </button>
      </div>
    </motion.div>
  );
}
