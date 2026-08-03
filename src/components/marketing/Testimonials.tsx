'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

import { useT } from '@/lib/i18n/use-t';
import { EASE_OUT_EXPO } from '@/lib/motion';

const INTERVAL_MS = 5500;

/** Étoile pleine, en `currentColor` : contrairement à l'emoji ⭐, elle suit la couleur du texte. */
function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

/**
 * Un témoignage à la fois, avec transition — même famille que le slide des
 * occasions, pour que le site n'ait pas deux logiques de carrousel
 * différentes. Pagination en points cliquables plutôt qu'une barre de
 * progression : trois éléments n'ont pas besoin de plus.
 */
export function Testimonials() {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = t.testimonials.items.length;

  const go = useCallback((next: number) => setIndex(((next % total) + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => setIndex((i) => (i + 1) % total), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, total]);

  const item = t.testimonials.items[index];

  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-20 text-center">
      <p className="flex items-center justify-center gap-2.5">
        <span aria-hidden="true" className="text-base">
          💬
        </span>
        <span className="font-serif text-base italic text-bordeaux-600">
          {t.testimonials.eyebrow}
        </span>
      </p>
      <h2 className="mt-4 font-serif text-4xl font-black leading-[1.06] text-ink-900 sm:text-5xl">
        {t.testimonials.title1} <span className="gradient-text">{t.testimonials.title2}</span>
      </h2>

      <div
        className="relative mt-12"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div
          role="group"
          aria-roledescription="carrousel"
          aria-label={t.testimonials.eyebrow}
          className="relative min-h-[228px] overflow-hidden rounded-[var(--radius-card)] border border-cream-300 bg-cream-50 p-8 sm:min-h-[204px] sm:p-10"
        >
          <AnimatePresence mode="wait">
            <motion.figure
              key={item.name}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
              aria-roledescription="diapositive"
            >
              <div className="flex justify-center gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 text-bordeaux-400" />
                ))}
              </div>

              <blockquote className="mx-auto mt-4 max-w-lg font-serif text-lg italic leading-relaxed text-ink-900">
                « {item.quote} »
              </blockquote>

              <figcaption className="mt-6 flex items-center justify-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-ink"
                >
                  {item.name.charAt(0)}
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-ink-900">{item.name}</span>
                  <span className="block text-xs text-ink-400">{item.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div
          role="tablist"
          aria-label={t.testimonials.chooseAria}
          className="mt-5 flex items-center justify-center gap-2"
        >
          {t.testimonials.items.map((option, i) => {
            const selected = i === index;
            return (
              <button
                key={option.name}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={option.name}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all ${
                  selected ? 'w-6 bg-accent' : 'w-2 bg-cream-300 hover:bg-bordeaux-300'
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
