import { notFound } from 'next/navigation';

import { BlogArticleView } from '@/components/marketing/BlogArticleView';
import { getPostBySlug, getPublishedPosts } from '@/lib/blog/posts';

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return { title: 'Article introuvable' };

  return {
    title: post.title.fr,
    description: post.excerpt.fr,
    openGraph: {
      title: post.title.fr,
      description: post.excerpt.fr,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  // Un brouillon reste accessible par URL directe mais n'est jamais listé.
  if (!post) {
    notFound();
  }

  return <BlogArticleView post={post} />;
}
