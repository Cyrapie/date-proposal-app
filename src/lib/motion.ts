/**
 * Courbe d'accélération partagée par les transitions du parcours destinataire.
 * Le tuple explicite est nécessaire : Framer Motion refuse un `number[]`.
 */
export const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];
