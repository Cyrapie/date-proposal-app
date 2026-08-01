import Link from 'next/link';

import { Heart } from '@/components/ui/Heart';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const metadata = {
  title: 'Super Admin',
  robots: { index: false, follow: false },
};

/**
 * Chrome du tableau de bord admin. Volontairement distinct de `(marketing)`
 * et de `/dashboard` : c'est un espace opérateur, pas un espace créateur.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-100/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-bordeaux-500" />
            <span className="font-serif text-lg leading-none text-ink-900">Super Admin</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="rounded-full border border-cream-300 px-4 py-2 text-xs font-semibold text-ink-600 transition hover:border-bordeaux-500 hover:text-bordeaux-500"
            >
              Mon espace créateur
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>
    </div>
  );
}
