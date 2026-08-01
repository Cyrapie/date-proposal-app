'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Messages affichés à chaque tentative (parcourus cycliquement). */
const TEASE_MESSAGES = [
  'Essaie encore',
  'Tu es sûr ?',
  'Non non',
  'Pas cette fois',
  'Vraiment ?',
] as const;

/** Marge intérieure conservée entre le bouton et le bord de la zone de jeu. */
const EDGE_PADDING = 8;

type Offset = { x: number; y: number };

type NoButtonProps = {
  /** Notifie l'écran parent pour afficher le message de taquinerie. */
  onTease: (message: string) => void;
  /** Notifie que le bouton est définitivement neutralisé. */
  onExhausted?: () => void;
  className?: string;
};

/**
 * Bouton « Non » qui se dérobe.
 *
 * Il n'expose délibérément aucun callback de refus : quel que soit le nombre de
 * clics, il ne peut structurellement pas déclencher une réponse « Non ».
 * Après 3 ou 4 tentatives (tirage aléatoire au montage), il passe en
 * `pointer-events: none` et continue de dériver seul pour l'effet comique.
 */
export function NoButton({ onTease, onExhausted, className }: NoButtonProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [exhausted, setExhausted] = useState(false);

  // Compteurs hors état de rendu : leur mise à jour ne doit pas provoquer de
  // rendu supplémentaire, et le tirage aléatoire doit rester hors du rendu.
  const offsetRef = useRef<Offset>({ x: 0, y: 0 });
  const attemptsRef = useRef(0);
  const exhaustedRef = useRef(false);
  const maxAttemptsRef = useRef(3);

  // Tirage au chargement : 3 ou 4 tentatives autorisées.
  useEffect(() => {
    maxAttemptsRef.current = Math.random() < 0.5 ? 3 : 4;
  }, []);

  /**
   * Tire une position aléatoire dans une ellipse centrée sur la position
   * d'origine, puis la borne à la zone de jeu : le bouton ne peut jamais
   * sortir du cadre visible.
   */
  const pickOffset = useCallback((current: Offset): Offset => {
    const field = fieldRef.current;
    const button = buttonRef.current;
    if (!field || !button) return current;

    const maxX = Math.max(0, (field.clientWidth - button.offsetWidth) / 2 - EDGE_PADDING);
    const maxY = Math.max(0, (field.clientHeight - button.offsetHeight) / 2 - EDGE_PADDING);

    if (maxX === 0 && maxY === 0) return current;

    // Rayon entre 45 % et 100 % du maximum : le saut reste toujours lisible.
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.45 + Math.random() * 0.55;

    const candidate = {
      x: Math.cos(angle) * maxX * radius,
      y: Math.sin(angle) * maxY * radius,
    };

    // Si le tirage retombe trop près, on part à l'opposé.
    const distance = Math.hypot(candidate.x - current.x, candidate.y - current.y);
    if (distance < Math.min(maxX, maxY) * 0.5) {
      candidate.x = -candidate.x;
      candidate.y = -candidate.y;
    }

    return {
      x: Math.max(-maxX, Math.min(maxX, candidate.x)),
      y: Math.max(-maxY, Math.min(maxY, candidate.y)),
    };
  }, []);

  const move = useCallback(() => {
    const next = pickOffset(offsetRef.current);
    offsetRef.current = next;
    setOffset(next);
  }, [pickOffset]);

  const flee = useCallback(() => {
    if (exhaustedRef.current) return;

    attemptsRef.current += 1;
    onTease(TEASE_MESSAGES[(attemptsRef.current - 1) % TEASE_MESSAGES.length]);
    move();

    if (attemptsRef.current >= maxAttemptsRef.current) {
      // Point de non-retour : le bouton ne répondra plus jamais à un pointeur.
      exhaustedRef.current = true;
      setExhausted(true);
    }
  }, [move, onTease]);

  // Une fois neutralisé, le bouton continue de dériver seul : il n'est plus
  // cliquable, donc plus rien ne peut relancer l'animation depuis l'extérieur.
  useEffect(() => {
    if (!exhausted) return;

    onExhausted?.();

    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReducedMotion) return;

    const interval = window.setInterval(move, 1400);
    return () => window.clearInterval(interval);
  }, [exhausted, move, onExhausted]);

  return (
    <div
      ref={fieldRef}
      // Zone de jeu : borne physique de la fuite. `overflow-hidden` est une
      // sécurité supplémentaire par-dessus le calcul de bornes.
      className={`relative h-36 w-full overflow-hidden ${className ?? ''}`}
    >
      <motion.button
        ref={buttonRef}
        type="button"
        // Aucun handler de refus : ce bouton ne peut pas répondre « Non ».
        onClick={flee}
        onPointerEnter={flee}
        onFocus={flee}
        aria-disabled={exhausted}
        tabIndex={exhausted ? -1 : 0}
        className="absolute left-1/2 top-1/2 rounded-full border px-7 py-3 text-base font-medium"
        style={{
          // Le retrait du bouton du flux de pointeurs est ce qui garantit
          // qu'aucune réponse « Non » ne pourra jamais partir.
          pointerEvents: exhausted ? 'none' : 'auto',
          borderColor: 'var(--theme-border)',
          background: 'var(--theme-surface)',
          color: 'var(--theme-muted)',
        }}
        initial={false}
        animate={{
          x: offset.x,
          y: offset.y,
          translateX: '-50%',
          translateY: '-50%',
          rotate: exhausted ? [0, -4, 4, 0] : 0,
          opacity: exhausted ? 0.55 : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 24,
          // ≈ 250 ms perçus, dans la fourchette 200–300 ms demandée.
          mass: 0.6,
          rotate: { duration: 0.5 },
        }}
      >
        Non
      </motion.button>
    </div>
  );
}
