import 'server-only';

import { redirect } from 'next/navigation';

import { isAllowedConsoleEmail } from '@/lib/console/access';
import { publicEnv } from '@/lib/env';
import { createConsoleClient } from '@/lib/supabase/console';

export type ConsoleAdmin = { id: string; email: string };

/**
 * Seul point de décision « cet appelant peut-il utiliser la console ? ».
 *
 * Trois barrières cumulatives, dans cet ordre :
 *   1. une session valide sur le cookie *console* (pas celui du créateur) ;
 *   2. l'email figure dans l'allowlist du code ;
 *   3. `users.is_super_admin` est vrai en base, lu via la session de
 *      l'appelant lui-même (RLS : il ne voit que sa propre ligne).
 *
 * Aucune ne suffit seule. Retourne `null` plutôt que de lever : l'appelant
 * décide s'il redirige ou s'il renvoie une 404.
 */
export async function getConsoleAdmin(): Promise<ConsoleAdmin | null> {
  // Supabase non configuré : on refuse l'accès sans lever. Sinon la console
  // répondrait 500 là où `/console/login` sait afficher quoi renseigner.
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) return null;

  const supabase = await createConsoleClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;
  if (!isAllowedConsoleEmail(user.email)) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id, email, is_super_admin')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[console] Lecture du profil impossible', error);
    return null;
  }

  if (!data?.is_super_admin) return null;
  return { id: data.id, email: data.email };
}

/** Variante pour les pages : renvoie vers la connexion console si refusé. */
export async function requireConsoleAdmin(): Promise<ConsoleAdmin> {
  const admin = await getConsoleAdmin();
  if (!admin) redirect('/console/login');
  return admin;
}
