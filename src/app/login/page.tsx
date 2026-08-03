import { LoginForm } from '@/components/auth/LoginForm';
import { LoginFooterLinks, LoginHeader } from '@/components/auth/LoginIntro';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
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
      {/* Le sélecteur de langue est ici aussi : c'est la première page qu'un
          créateur anglophone voit s'il arrive par un lien direct. */}
      <div className="absolute right-5 top-5 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8">
          <LoginHeader />
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

        <LoginFooterLinks />
      </div>
    </main>
  );
}
