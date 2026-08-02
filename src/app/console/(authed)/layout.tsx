import { ConsoleNav } from '@/components/console/ConsoleNav';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { requireConsoleAdmin } from '@/lib/console/guard';

// La console reflète l'état courant de la base : jamais de page en cache.
export const dynamic = 'force-dynamic';

/**
 * Chrome de la console. Aucun lien vers l'espace créateur ni vers la vitrine :
 * c'est un outil d'exploitation séparé, pas une section du produit.
 */
export default async function ConsoleAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireConsoleAdmin();

  return (
    <div className="flex min-h-dvh flex-col bg-cream-100">
      <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-100/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent font-serif text-sm font-black text-accent-ink">
              O
            </span>
            <span className="font-serif text-lg leading-none text-ink-900">Console</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-ink-400 sm:inline">{admin.email}</span>
            <ThemeToggle />
            <form action="/console/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-full border border-cream-300 px-4 py-2 text-xs font-semibold text-ink-600 transition hover:border-bordeaux-500 hover:text-bordeaux-500"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-5 py-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ConsoleNav />
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
