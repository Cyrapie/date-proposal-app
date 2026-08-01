import Link from 'next/link';

import { PageHeader } from '@/components/marketing/PageHeader';
import { getPublishedPosts } from '@/lib/blog/posts';
import { formatShortDate } from '@/lib/format';

export const metadata = {
  title: 'Blog',
  description:
    'Nos réflexions sur l’art de proposer un rendez-vous, et les décisions de conception derrière l’application.',
};

export default function BlogIndexPage() {
  const posts = getPublishedPosts();

  return (
    <>
      <PageHeader eyebrow="Blog" title="Notes et" accent="coulisses">
        <p>
          Comment proposer un rendez-vous sans y passer la semaine, et pourquoi nous avons
          tranché comme ça plutôt qu’autrement.
        </p>
      </PageHeader>

      <div className="mx-auto w-full max-w-3xl px-5 py-16">

      {posts.length === 0 ? (
        <p className="rounded-[var(--radius-vitrine)] border border-dashed border-cream-300 p-10 text-center text-sm text-ink-400">
          Le premier article arrive bientôt.
        </p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-[var(--radius-vitrine)] border border-cream-300 bg-cream-50 p-7 transition hover:border-bordeaux-500"
              >
                <p className="text-xs text-ink-400">
                  <time dateTime={post.date}>{formatShortDate(post.date)}</time>
                  <span className="mx-2">·</span>
                  {post.readingMinutes} min de lecture
                </p>
                <h2 className="mt-3 font-serif text-2xl leading-tight text-ink-900">
                  {post.title}
                </h2>
                {post.excerpt ? (
                  <p className="mt-2 text-sm leading-relaxed text-ink-400">{post.excerpt}</p>
                ) : null}
                <span className="mt-4 inline-block text-sm font-medium text-bordeaux-600">
                  Lire →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>
    </>
  );
}
