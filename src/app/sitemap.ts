import type { MetadataRoute } from 'next';

import { getPublishedPosts } from '@/lib/blog/posts';
import { publicEnv } from '@/lib/env';

/**
 * Pages publiques uniquement. Le dashboard, la connexion et surtout les liens
 * d'invitation `/d/[slug]` n'ont rien à faire dans un plan du site.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicEnv.siteUrl.replace(/\/$/, '');

  const pages = ['', '/tarifs', '/partenaires', '/blog', '/a-propos', '/contact', '/privacy'].map(
    (route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.7,
    }),
  );

  const posts = getPublishedPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  return [...pages, ...posts];
}
