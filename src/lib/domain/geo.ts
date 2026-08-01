/** Lien cartographique sans clé API, reconstruit à l'affichage. */
export function mapsUrl(input: {
  label?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): string | null {
  // Les coordonnées priment : elles pointent le lieu exact, pas une
  // interprétation de l'adresse par le moteur de recherche.
  if (typeof input.latitude === 'number' && typeof input.longitude === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${input.latitude},${input.longitude}`;
  }

  const query = [input.label, input.address].filter(Boolean).join(' ').trim();
  if (!query) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Arrondi à 6 décimales, soit environ 10 cm. Au-delà c'est du bruit. */
export function roundCoord(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}
