import { Post } from '@/types';
import { cache } from 'react';
import 'server-only';
import { getPosts } from './getPosts';

export const preload = (id: string) => {
  void getAdjacencyPostsById(id);
};

export const getAdjacencyPostsById = cache(
  async (id: string): Promise<Post[]> => {
    console.log('get adj posts by id', id);
    const posts = await getPosts();
    return posts.filter(
      p =>
        p.id === id || p.backlinks.includes(id) || p.forwardLinks.includes(id),
    );
  },
);
