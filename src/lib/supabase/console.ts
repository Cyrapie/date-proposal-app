import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import type { Database } from '@/lib/supabase/database.types';
import { requirePublicEnv } from '@/lib/env';

/**
 * Préfixe de cookie propre à la console.
 *
 * C'est ce qui rend la session réellement indépendante : le client créateur
 * (`supabase/server.ts`) utilise le préfixe `sb-` par défaut, celui-ci écrit
 * ailleurs. Se connecter à la console ne connecte donc pas à `/dashboard`, et
 * se déconnecter de l'un laisse l'autre intact — y compris dans le même
 * navigateur, sur le même domaine.
 */
export const CONSOLE_COOKIE_NAME = 'otyche-console';

/** Client serveur lié à la session console. Soumis aux policies RLS. */
export async function createConsoleClient() {
  // `cookies()` en premier : il signale à Next que le rendu est dynamique.
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = requirePublicEnv();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions: { name: CONSOLE_COOKIE_NAME },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component : le rafraîchissement est pris
          // en charge par `proxy.ts`.
        }
      },
    },
  });
}
