import { redirect } from 'next/navigation';

import { ConsoleLoginForm } from '@/components/console/ConsoleLoginForm';
import { BrandIcon } from '@/components/ui/BrandLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getConsoleAdmin } from '@/lib/console/guard';
import { publicEnv } from '@/lib/env';

export const metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

// Dépend de la session : jamais mise en cache.
export const dynamic = 'force-dynamic';

export default async function ConsoleLoginPage() {
  // Déjà connecté et autorisé : inutile de redemander les identifiants.
  if (await getConsoleAdmin()) {
    redirect('/console');
  }

  const configured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <BrandIcon size={36} className="mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-black leading-[1.06] text-ink-900">Console</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-400">
            Espace d’administration Keerelle. Sans rapport avec votre compte créateur.
          </p>
        </div>

        {configured ? (
          <ConsoleLoginForm />
        ) : (
          <div className="rounded-card border border-cream-300 bg-cream-50 p-5 text-sm leading-relaxed text-ink-600">
            <p className="font-medium text-ink-900">Configuration requise</p>
            <p className="mt-2">
              Renseignez <code className="rounded bg-cream-200 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{' '}
              et <code className="rounded bg-cream-200 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,
              puis relancez le serveur.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
