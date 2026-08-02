import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';
import { marked } from 'marked';

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog');

export type LocalizedText = { fr: string; en: string };

export type PostMeta = {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  date: string;
  author: LocalizedText;
  readingMinutes: { fr: number; en: number };
  /** Retire l'article de la liste et du plan du site, sans le supprimer. */
  draft: boolean;
};

export type Post = PostMeta & { html: LocalizedText };

type ParsedFile = {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  draft: boolean;
  readingMinutes: number;
  html: string;
};

function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function parseFile(raw: string, slug: string): ParsedFile {
  const { data, content } = matter(raw);

  return {
    title: typeof data.title === 'string' ? data.title : slug,
    excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
    // Normalisé en ISO : `gray-matter` rend un Date quand la valeur n'est pas
    // entre guillemets dans le front-matter.
    date:
      data.date instanceof Date
        ? data.date.toISOString()
        : typeof data.date === 'string'
          ? data.date
          : new Date().toISOString(),
    author: typeof data.author === 'string' ? data.author : 'L’équipe',
    draft: data.draft === true,
    readingMinutes: readingMinutes(content),
    html: marked.parse(content, { async: false }),
  };
}

/**
 * Chaque article vit en `{slug}.md` (français, obligatoire) avec un
 * `{slug}.en.md` optionnel pour la traduction. Sans traduction, la version
 * anglaise retombe sur le contenu français plutôt que de laisser un trou.
 */
function parse(fileName: string): Post {
  const slug = fileName.replace(/\.md$/, '');
  const fr = parseFile(fs.readFileSync(path.join(POSTS_DIR, fileName), 'utf8'), slug);

  const enPath = path.join(POSTS_DIR, `${slug}.en.md`);
  const en = fs.existsSync(enPath) ? parseFile(fs.readFileSync(enPath, 'utf8'), slug) : fr;

  return {
    slug,
    title: { fr: fr.title, en: en.title },
    excerpt: { fr: fr.excerpt, en: en.excerpt },
    date: fr.date,
    author: { fr: fr.author, en: en.author },
    readingMinutes: { fr: fr.readingMinutes, en: en.readingMinutes },
    draft: fr.draft,
    html: { fr: fr.html, en: en.html },
  };
}

function allPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md') && !file.endsWith('.en.md'))
    .map(parse)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/** Articles publiés, du plus récent au plus ancien. */
export function getPublishedPosts(): Post[] {
  return allPosts().filter((post) => !post.draft);
}

export function getPostBySlug(slug: string): Post | null {
  return allPosts().find((post) => post.slug === slug) ?? null;
}
