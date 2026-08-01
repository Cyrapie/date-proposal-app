import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import type { Database } from '@/lib/supabase/database.types';
import { requirePublicEnv } from '@/lib/env';

/**
 * Client serveur lié à la session du créateur (Server Components, Route
 * Handlers, Server Actions). Soumis aux policies RLS.
 */
export async function createClient() {
  // `cookies()` en premier : il signale à Next que le rendu est dynamique.
  // Lever avant cet appel ferait échouer le prerender au lieu de le désactiver.
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = requirePublicEnv();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
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
          // Appelé depuis un Server Component : le rafraîchissement de session
          // est déjà pris en charge par `proxy.ts`, on peut ignorer.
        }
      },
    },
  });
}

/** Retourne l'utilisateur authentifié, ou `null`. */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
