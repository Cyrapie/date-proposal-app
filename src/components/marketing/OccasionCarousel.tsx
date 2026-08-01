'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PROPOSAL_TYPES, PROPOSAL_TYPE_META } from '@/lib/domain/proposal';
import { EASE_OUT_EXPO } from '@/lib/motion';

/** Accroche marketing par occasion — distincte du `headline` de la lettre. */
const PITCH: Record<(typeof PROPOSAL_TYPES)[number], string> = {
  cinema: "Deux séances possibles, elle choisit l'horaire qui l'arrange.",
  restaurant: 'Trois tables repérées, un seul lien à envoyer.',
  weekend: 'Une escapade à deux, avec les dates que vous pouvez vraiment tenir.',
  activity: 'Escalade, expo, atelier poterie. Proposez, laissez trancher.',
  surprise: 'Le lieu reste caché jusqu’à ce que la réponse soit oui.',
  birthday: 'Un anniversaire qui commence par une belle enveloppe.',
  just_because: 'Aucune raison particulière. C’est souvent la meilleure.',
};

const INTERVAL_MS = 5000;

export function OccasionCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = PROPOSAL_TYPES.length;
  const go = useCallback((next: number) => setIndex(((next % total) + total) % total), [total]);

  // Défilement automatique, suspendu au survol, au focus et si l'utilisateur
  // a demandé moins d'animations.
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => setIndex((i) => (i + 1) % total), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, total]);

  const type = PROPOSAL_TYPES[index];
  const meta = PROPOSAL_TYPE_META[type];

  return (
    <section
      aria-roledescription="carrousel"
      aria-label="Types d’occasion"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const delta = event.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 45) go(index + (delta < 0 ? 1 : -1));
        touchStartX.current = null;
      }}
    >
      <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-cream-300 bg-bordeaux-50">
        {/* Hauteur réservée : évite que la page saute d'une slide à l'autre. */}
        <div className="relative h-[340px] sm:h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={type}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
              className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${index + 1} sur ${total}, ${meta.label}`}
            >
              <span className="text-5xl" aria-hidden="true">
                {meta.emoji}
              </span>
              <p className="mt-5 text-xs uppercase tracking-[0.18em] text-ink-400">
                {meta.label}
              </p>
              <h3 className="mt-3 font-serif text-3xl leading-tight text-bordeaux-500 sm:text-4xl">
                {meta.headline}
              </h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink-600">
                {PITCH[type]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-cream-300 px-4 py-3">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Occasion précédente"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-300 text-ink-600 transition hover:border-bordeaux-500 hover:text-bordeaux-500"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="Choisir une occasion">
            {PROPOSAL_TYPES.map((option, i) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={PROPOSAL_TYPE_META[option].label}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? 'w-6 bg-accent' : 'w-2 bg-cream-300 hover:bg-bordeaux-500'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Occasion suivante"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-300 text-ink-600 transition hover:border-bordeaux-500 hover:text-bordeaux-500"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Annonce le changement de slide aux lecteurs d'écran. */}
      <p className="sr-only" aria-live="polite">
        {meta.label}, diapositive {index + 1} sur {total}
      </p>
    </section>
  );
}
