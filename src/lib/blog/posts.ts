import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import matter from 'gray-matter';
import { marked } from 'marked';

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog');

export type PostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readingMinutes: number;
  /** Retire l'article de la liste et du plan du site, sans le supprimer. */
  draft: boolean;
};

export type Post = PostMeta & { html: string };

function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function parse(fileName: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), 'utf8');
  const { data, content } = matter(raw);
  const slug = fileName.replace(/\.md$/, '');

  return {
    slug,
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
    readingMinutes: readingMinutes(content),
    draft: data.draft === true,
    html: marked.parse(content, { async: false }),
  };
}

function allPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
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
