import { BlogListView } from '@/components/marketing/BlogListView';
import { getPublishedPosts } from '@/lib/blog/posts';

export const metadata = {
  title: 'Blog',
  description:
    'Nos réflexions sur l’art de proposer un rendez-vous, et les décisions de conception derrière l’application.',
};

export default function BlogIndexPage() {
  const posts = getPublishedPosts();

  return <BlogListView posts={posts} />;
}
