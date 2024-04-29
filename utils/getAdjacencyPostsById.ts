import { Post } from '@/types';
import { getPosts } from './getPosts';

export const getAdjacencyPostsById = async (id: string): Promise<Post[]> => {
  const posts = await getPosts();
  return posts.filter(
    p => p.id === id || p.backlinks.includes(id) || p.forwardLinks.includes(id),
  );
};
