import type { MetadataRoute } from 'next';

import { publicEnv } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const base = publicEnv.siteUrl.replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Les liens d'invitation sont privés : ils ne doivent jamais être
      // explorés, même si quelqu'un en publie un par mégarde.
      disallow: ['/d/', '/dashboard', '/admin', '/login', '/auth/', '/api/', '/preview/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
