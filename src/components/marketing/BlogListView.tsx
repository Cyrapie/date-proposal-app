'use client';

import Link from 'next/link';

import { PageHeader } from '@/components/marketing/PageHeader';
import type { Post } from '@/lib/blog/posts';
import { formatShortDateIn } from '@/lib/format';
import { useLang } from '@/lib/i18n/language';
import { useT } from '@/lib/i18n/use-t';

export function BlogListView({ posts }: { posts: Post[] }) {
  const t = useT();
  const lang = useLang();

  return (
    <>
      <PageHeader eyebrow={t.blogListPage.eyebrow} title={t.blogListPage.title1} accent={t.blogListPage.title2}>
        <p>{t.blogListPage.intro}</p>
      </PageHeader>

      <div className="mx-auto w-full max-w-3xl px-5 py-16">
        {posts.length === 0 ? (
          <p className="rounded-[var(--radius-vitrine)] border border-dashed border-cream-300 p-10 text-center text-sm text-ink-400">
            {t.blogListPage.empty}
          </p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post, index) => (
              <li
                key={post.slug}
                data-reveal
                style={{ '--reveal-delay': `${Math.min(index, 5) * 60}ms` } as React.CSSProperties}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="block rounded-[var(--radius-vitrine)] border border-cream-300 bg-cream-50 p-7 transition hover:border-bordeaux-500"
                >
                  <p className="text-xs text-ink-400">
                    <time dateTime={post.date}>{formatShortDateIn(post.date, lang)}</time>
                    <span className="mx-2">·</span>
                    {t.blogListPage.readingMinutes(post.readingMinutes[lang])}
                  </p>
                  <h2 className="mt-3 font-serif text-2xl leading-tight text-ink-900">
                    {post.title[lang]}
                  </h2>
                  {post.excerpt[lang] ? (
                    <p className="mt-2 text-sm leading-relaxed text-ink-400">{post.excerpt[lang]}</p>
                  ) : null}
                  <span className="mt-4 inline-block text-sm font-medium text-bordeaux-600">
                    {t.blogListPage.readMore} →
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
