'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useT } from '@/lib/i18n/use-t';
import { PROPOSAL_TYPES } from '@/lib/domain/proposal';
import { EASE_OUT_EXPO } from '@/lib/motion';

const EMOJI: Record<(typeof PROPOSAL_TYPES)[number], string> = {
  cinema: '🎬',
  restaurant: '🍷',
  weekend: '🧳',
  activity: '🎯',
  surprise: '🎁',
  birthday: '🎂',
  just_because: '💌',
};

const INTERVAL_MS = 5000;

export function OccasionCarousel() {
  const t = useT();
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
  const label = t.occasions.labels[type];
  const headline = t.occasions.headlines[type];
  const pitch = t.occasions.pitches[type];

  return (
    <section
      aria-roledescription="carrousel"
      aria-label={t.occasions.ariaLabel}
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
              aria-label={t.occasions.slideAria(index + 1, total, label)}
            >
              <span className="text-5xl" aria-hidden="true">
                {EMOJI[type]}
              </span>
              <p className="mt-5 text-xs uppercase tracking-[0.18em] text-ink-400">
                {label}
              </p>
              <h3 className="mt-3 font-serif text-3xl leading-tight text-bordeaux-500 sm:text-4xl">
                {headline}
              </h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink-600">
                {pitch}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-cream-300 px-4 py-3">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={t.occasions.prev}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-300 text-ink-600 transition hover:border-bordeaux-500 hover:text-bordeaux-500"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label={t.occasions.chooseAria}>
            {PROPOSAL_TYPES.map((option, i) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={t.occasions.labels[option]}
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
            aria-label={t.occasions.next}
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
        {t.occasions.slideLive(label, index + 1, total)}
      </p>
    </section>
  );
}
