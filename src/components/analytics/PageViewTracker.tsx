'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { trackPageView } from '@/lib/analytics/track';

/** Monté une fois dans le layout racine : une vue de page par changement de route. */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
