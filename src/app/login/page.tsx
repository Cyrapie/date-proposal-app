import Link from 'next/link';

import { LoginForm } from '@/components/auth/LoginForm';
import { Heart } from '@/components/ui/Heart';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { publicEnv } from '@/lib/env';

export const metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const configured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Heart className="mx-auto mb-4 h-8 w-8 text-bordeaux-500" />
          <h1 className="font-serif text-3xl font-black leading-[1.06] text-ink-900">Bon retour</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-400">
            Entrez votre email : vous recevrez un lien de connexion, sans mot de passe.
          </p>
        </div>

        {configured ? (
          <LoginForm nextPath={next} />
        ) : (
          <div className="rounded-card border border-cream-300 bg-cream-50 p-5 text-sm leading-relaxed text-ink-600">
            <p className="font-medium text-ink-900">Configuration requise</p>
            <p className="mt-2">
              Renseignez <code className="rounded bg-cream-200 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{' '}
              et <code className="rounded bg-cream-200 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
              dans <code className="rounded bg-cream-200 px-1">.env.local</code>, puis relancez le
              serveur. Voir le README.
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-ink-400">
          <Link href="/" className="underline underline-offset-4 hover:text-ink-600">
            Retour à l&apos;accueil
          </Link>
          <span className="mx-2">·</span>
          <Link href="/privacy" className="underline underline-offset-4 hover:text-ink-600">
            Confidentialité
          </Link>
        </p>
      </div>
    </main>
  );
}
