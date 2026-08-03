'use client';

import { useEffect, useRef, useState } from 'react';

import { useT } from '@/lib/i18n/use-t';
import { PROPOSAL_TYPES } from '@/lib/domain/proposal';

const EMOJI: Record<(typeof PROPOSAL_TYPES)[number], string> = {
  cinema: '🎬',
  restaurant: '🍷',
  weekend: '🧳',
  activity: '🎯',
  surprise: '🎁',
  birthday: '🎂',
  just_because: '💌',
};

/** Largeur de carte + espacement (`w-[172px]` + `gap-3`) : sert au pas des flèches et au calcul du point actif. */
const STEP = 172 + 12;
const TOTAL = PROPOSAL_TYPES.length;

/**
 * Carrousel à défilement horizontal : toutes les occasions sont des cartes
 * qu'on fait glisser, calées par carte grâce à `scroll-snap` plutôt qu'une
 * logique d'index en JS pour le défilement lui-même.
 *
 * Les flèches et les points sont un raccourci au-dessus de ce même scroll —
 * ils appellent `scrollTo`, ils ne remplacent pas de logique de pagination
 * séparée. Le point actif suit la position réelle de défilement (utile
 * quand on arrive ici en glissant à la main), pas un état qu'on maintient
 * à côté et qui pourrait diverger.
 */
export function OccasionCarousel() {
  const t = useT();
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startScroll: number; moved: boolean } | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Calcul immédiat, pas de `requestAnimationFrame` : ce n'est pas une
    // animation, juste une division, et rAF se met en pause quand l'onglet
    // passe en arrière-plan — inutile d'y accrocher un état aussi simple.
    const onScroll = () => setActive(Math.round(track.scrollLeft / STEP));

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  function goTo(index: number) {
    const clamped = Math.max(0, Math.min(TOTAL - 1, index));
    // Mis à jour tout de suite plutôt que d'attendre l'événement `scroll` du
    // défilement fluide déclenché juste en dessous : un clic sait déjà vers
    // quelle carte il va, pas besoin de laisser le point actif à la traîne
    // le temps de l'animation.
    setActive(clamped);
    trackRef.current?.scrollTo({
      left: clamped * STEP,
      behavior: 'smooth',
    });
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    // Le clic droit et le tactile (déjà géré nativement par le scroll du
    // navigateur) n'ont pas besoin de ce glisser-déposer maison.
    if (event.pointerType === 'touch' || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;

    dragState.current = { startX: event.clientX, startScroll: track.scrollLeft, moved: false };
    track.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragState.current;
    const track = trackRef.current;
    if (!drag || !track) return;

    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 3) drag.moved = true;
    track.scrollLeft = drag.startScroll - delta;
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    trackRef.current?.releasePointerCapture(event.pointerId);
    dragState.current = null;
  }

  return (
    // `min-w-0` : sans lui, cet élément — enfant d'une grille — refuse de
    // rétrécir sous la largeur de son contenu (les 7 cartes bout à bout),
    // et pousse toute la grille en dehors du viewport au lieu de défiler.
    <div className="min-w-0">
      <div
        ref={trackRef}
        role="region"
        aria-label={t.occasions.ariaLabel}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        // Un clic qui a servi à glisser ne doit pas aussi activer la carte
        // sous le pointeur (lien ou bouton, le cas échéant, à l'avenir).
        onClickCapture={(event) => {
          if (dragState.current?.moved) event.preventDefault();
        }}
        className="occasion-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [cursor:grab] active:[cursor:grabbing]"
      >
        {PROPOSAL_TYPES.map((type) => (
          <article
            key={type}
            tabIndex={0}
            className="group w-[172px] shrink-0 snap-start rounded-2xl border border-cream-300 bg-cream-50 p-5 text-center transition hover:-translate-y-0.5 hover:border-bordeaux-500 hover:bg-bordeaux-50 focus-visible:-translate-y-0.5 focus-visible:border-bordeaux-500 focus-visible:bg-bordeaux-50 focus-visible:outline-none active:translate-y-0 active:bg-bordeaux-50"
          >
            <span aria-hidden="true" className="text-2xl">
              {EMOJI[type]}
            </span>
            <h3 className="mt-3 font-serif text-lg font-bold leading-tight text-ink-900 transition group-hover:text-bordeaux-600">
              {t.occasions.labels[type]}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-400">
              {t.occasions.pitches[type]}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label={t.occasions.prev}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream-300 text-ink-600 transition hover:border-bordeaux-500 hover:text-bordeaux-500 disabled:pointer-events-none disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label={t.occasions.chooseAria}>
          {PROPOSAL_TYPES.map((type, i) => (
            <button
              key={type}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={t.occasions.labels[type]}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === active ? 'w-6 bg-accent' : 'w-2 bg-cream-300 hover:bg-bordeaux-300'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(active + 1)}
          disabled={active === TOTAL - 1}
          aria-label={t.occasions.next}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream-300 text-ink-600 transition hover:border-bordeaux-500 hover:text-bordeaux-500 disabled:pointer-events-none disabled:opacity-30"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
