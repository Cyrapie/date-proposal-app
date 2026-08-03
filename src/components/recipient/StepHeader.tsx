'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { EASE_OUT_EXPO } from '@/lib/motion';

/**
 * En-tête commun aux étapes du parcours destinataire.
 *
 * Reprend le rythme typographique de `PageHeader` côté vitrine — surtitre en
 * capitales espacées, puis titre serif — pour qu'une invitation ne donne pas
 * l'impression de sortir d'un autre produit. La différence tient aux couleurs :
 * ici elles viennent des tokens `--theme-*` du thème choisi à la création, pas
 * de la palette crème et bordeaux du site.
 */
export function StepHeader({
  eyebrow,
  title,
  /** Emoji de l'occasion, présenté en médaillon au-dessus du surtitre. */
  icon,
  children,
  delay = 0,
}: {
  eyebrow: string;
  title: string;
  icon?: string;
  /** Paragraphe d'introduction, sous le titre. */
  children?: ReactNode;
  /** Décalage d'entrée, quand l'écran anime déjà d'autres éléments avant. */
  delay?: number;
}) {
  return (
    <header className="text-center">
      {icon ? (
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay, type: 'spring', stiffness: 260, damping: 18 }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
          style={{ background: 'var(--theme-accent-soft)' }}
          aria-hidden="true"
        >
          {icon}
        </motion.div>
      ) : null}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.6 }}
        className="text-xs uppercase tracking-[0.18em]"
        style={{ color: 'var(--theme-muted)' }}
      >
        {eyebrow}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.18, duration: 0.6, ease: EASE_OUT_EXPO }}
        className="mt-3 font-serif text-3xl leading-tight sm:text-4xl"
        style={{ color: 'var(--theme-accent)' }}
      >
        {title}
      </motion.h1>

      {children ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.26, duration: 0.6 }}
          className="mt-4 text-sm leading-relaxed"
          style={{ color: 'var(--theme-muted)' }}
        >
          {children}
        </motion.div>
      ) : null}
    </header>
  );
}
