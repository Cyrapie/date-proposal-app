'use client';

import Link from 'next/link';

import { PageHeader } from '@/components/marketing/PageHeader';
import type { Post } from '@/lib/blog/posts';
import { formatShortDateIn } from '@/lib/format';
import { useLang } from '@/lib/i18n/language';
import { useT } from '@/lib/i18n/use-t';
import { CTA_HREF } from '@/lib/marketing/nav';

export function BlogArticleView({ post }: { post: Post }) {
  const t = useT();
  const lang = useLang();

  return (
    <>
      <PageHeader
        eyebrow={post.draft ? t.blogArticlePage.draftBadge : t.blogArticlePage.articleBadge}
        title={post.title[lang]}
      >
        <p className="text-sm text-ink-400">
          <time dateTime={post.date}>{formatShortDateIn(post.date, lang)}</time>
          <span className="mx-2">·</span>
          {post.author[lang]}
          <span className="mx-2">·</span>
          {t.blogArticlePage.readingMinutes(post.readingMinutes[lang])}
        </p>
      </PageHeader>

      <article className="mx-auto w-full max-w-2xl px-5 py-16">
        <Link
          href="/blog"
          className="text-xs font-semibold text-bordeaux-600 underline underline-offset-4 hover:text-bordeaux-500"
        >
          {t.blogArticlePage.backToAll}
        </Link>

        {/*
          Le HTML vient de fichiers Markdown du dépôt, écrits par nous — pas de
          contenu soumis par des tiers, donc pas de surface d'injection ici.
        */}
        <div
          className="prose-invitation mt-8"
          dangerouslySetInnerHTML={{ __html: post.html[lang] }}
        />

        <aside className="mt-16 rounded-[var(--radius-vitrine)] border border-cream-300 bg-cream-50 p-8 text-center">
          <p className="font-serif text-2xl font-extrabold text-ink-900">{t.blogArticlePage.doneReadingTitle}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-400">
            {t.blogArticlePage.doneReadingBody}
          </p>
          <Link
            href={CTA_HREF}
            className="mt-6 inline-block rounded-full bg-accent px-8 py-3.5 text-base font-medium text-accent-ink transition hover:bg-accent-hover"
          >
            {t.nav.cta}
          </Link>
        </aside>
      </article>
    </>
  );
}
