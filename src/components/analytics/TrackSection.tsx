'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';

import { trackSectionView } from '@/lib/analytics/track';

/** Enveloppe une section et signale sa première apparition à mi-hauteur d'écran. */
export function TrackSection({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          trackSectionView(pathname, id, label);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pathname, id, label]);

  return <div ref={ref}>{children}</div>;
}
