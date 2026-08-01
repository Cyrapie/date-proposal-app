import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/marketing/PageHeader';
import { getPostBySlug, getPublishedPosts } from '@/lib/blog/posts';
import { formatShortDate } from '@/lib/format';
import { CTA } from '@/lib/marketing/nav';

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
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
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

  return (
    <>
      <PageHeader eyebrow={post.draft ? 'Brouillon, non publié' : 'Article'} title={post.title}>
        <p className="text-sm text-ink-400">
          <time dateTime={post.date}>{formatShortDate(post.date)}</time>
          <span className="mx-2">·</span>
          {post.author}
          <span className="mx-2">·</span>
          {post.readingMinutes} min de lecture
        </p>
      </PageHeader>

      <article className="mx-auto w-full max-w-2xl px-5 py-16">
        <Link
          href="/blog"
          className="text-xs font-semibold text-bordeaux-600 underline underline-offset-4 hover:text-bordeaux-500"
        >
          ← Tous les articles
        </Link>

      {/*
        Le HTML vient de fichiers Markdown du dépôt, écrits par nous — pas de
        contenu soumis par des tiers, donc pas de surface d'injection ici.
      */}
      <div
        className="prose-invitation mt-8"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <aside className="mt-16 rounded-[var(--radius-vitrine)] border border-cream-300 bg-cream-50 p-8 text-center">
        <p className="font-serif text-2xl font-extrabold text-ink-900">Assez lu ?</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-400">
          L’invitation se prépare en deux minutes.
        </p>
        <Link
          href={CTA.href}
          className="mt-6 inline-block rounded-full bg-accent px-8 py-3.5 text-base font-medium text-accent-ink transition hover:bg-accent-hover"
        >
          {CTA.label}
        </Link>
      </aside>
      </article>
    </>
  );
}
