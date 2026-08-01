import 'server-only';

import { headers } from 'next/headers';

/**
 * Pays de la requête, d'après l'en-tête posé par le réseau Vercel.
 * En local l'en-tête est absent : on retourne `null` et l'appelant retombe
 * sur ses valeurs par défaut.
 */
export async function getRequestCountry(): Promise<string | null> {
  const list = await headers();
  const code =
    list.get('x-vercel-ip-country') ?? list.get('cf-ipcountry') ?? null;

  // Vercel renvoie parfois "XX" quand la géolocalisation échoue.
  if (!code || code.length !== 2 || code === 'XX') return null;
  return code.toUpperCase();
}
