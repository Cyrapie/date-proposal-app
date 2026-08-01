/**
 * Accès centralisé aux variables d'environnement.
 * Les getters `server*` ne doivent jamais être importés depuis un composant client.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. Voir .env.example.`,
    );
  }
  return value;
}

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  defaultExpiryDays: Number(process.env.NEXT_PUBLIC_DEFAULT_LINK_EXPIRY_DAYS ?? 30),
};

export function requirePublicEnv() {
  return {
    supabaseUrl: required('NEXT_PUBLIC_SUPABASE_URL', publicEnv.supabaseUrl),
    supabaseAnonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY', publicEnv.supabaseAnonKey),
  };
}

export function requireServiceRoleKey() {
  return required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const emailEnv = {
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  from: process.env.EMAIL_FROM ?? 'Rendez-vous <onboarding@resend.dev>',
  replyTo: process.env.EMAIL_REPLY_TO || undefined,
};

/** Les emails sont désactivés (et loggés) tant qu'aucune clé Resend n'est fournie. */
export const emailEnabled = () => Boolean(emailEnv.resendApiKey);
