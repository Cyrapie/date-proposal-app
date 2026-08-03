'use client';

import Link from 'next/link';

import type { Post } from '@/lib/blog/posts';
import { formatShortDateIn } from '@/lib/format';
import { useT } from '@/lib/i18n/use-t';
import { useLang } from '@/lib/i18n/language';

/** Teaser « Conseils et coulisses » sur la page d'accueil. */
export function BlogTeaserView({ posts }: { posts: Post[] }) {
  const t = useT();
  const lang = useLang();

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-bordeaux-500">
            {t.blogTeaser.eyebrow}
          </p>
          <h2 className="mt-4 font-serif text-4xl font-black leading-[1.06] text-ink-900">
            {t.blogTeaser.title}
          </h2>
        </div>
        <Link
          href="/blog"
          className="rounded-full border border-cream-300 px-6 py-3 text-sm font-semibold text-bordeaux-600 transition hover:-translate-y-0.5 hover:border-bordeaux-500 hover:bg-bordeaux-50"
        >
          {t.blogTeaser.seeAll}
        </Link>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            data-reveal
            style={{ '--reveal-delay': `${index * 80}ms` } as React.CSSProperties}
            className="bloc group flex flex-col p-7"
          >
            <p className="text-xs text-ink-400">
              <time dateTime={post.date}>{formatShortDateIn(post.date, lang)}</time>
              <span className="mx-2">·</span>
              {post.readingMinutes[lang]} min
            </p>
            <h3 className="mt-3 font-serif text-xl font-bold leading-tight text-ink-900 transition group-hover:text-bordeaux-600">
              {post.title[lang]}
            </h3>
            {post.excerpt[lang] ? (
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">{post.excerpt[lang]}</p>
            ) : null}
            <span className="mt-5 text-sm font-semibold text-bordeaux-600">
              {t.blogTeaser.readMore}{' '}
              <span className="inline-block transition group-hover:translate-x-1">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
