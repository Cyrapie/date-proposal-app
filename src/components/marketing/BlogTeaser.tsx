import { BlogTeaserView } from '@/components/marketing/BlogTeaserView';
import { getPublishedPosts } from '@/lib/blog/posts';

/** Récupère les articles côté serveur ; l'affichage bilingue vit dans BlogTeaserView. */
export function BlogTeaser() {
  const posts = getPublishedPosts().slice(0, 3);
  if (posts.length === 0) return null;

  return <BlogTeaserView posts={posts} />;
}
