'use server';

import { redirect } from 'next/navigation';

import { isAllowedConsoleEmail } from '@/lib/console/access';
import { createConsoleClient } from '@/lib/supabase/console';

export type LoginState = { status: 'idle' | 'error'; message?: string };

/**
 * Connexion par email + mot de passe, réservée à la console.
 *
 * Le reste de l'application (créateurs) garde le lien magique. Ce choix est
 * volontaire ici : un opérateur unique, qui se reconnecte souvent depuis un
 * poste fixe, gagne à ne pas dépendre d'un aller-retour email à chaque
 * session.
 *
 * Le même message d'erreur sert pour « email non autorisé » et « mot de
 * passe incorrect », pour ne pas transformer ce formulaire en oracle qui
 * révélerait quelle adresse est celle de l'opérateur.
 */
export async function consoleSignIn(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { status: 'error', message: 'Email et mot de passe requis.' };
  }

  const echec: LoginState = { status: 'error', message: 'Identifiants invalides.' };

  if (!isAllowedConsoleEmail(email)) {
    return echec;
  }

  const supabase = await createConsoleClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('[console] Connexion refusée', error);
    return echec;
  }

  redirect('/console');
}
