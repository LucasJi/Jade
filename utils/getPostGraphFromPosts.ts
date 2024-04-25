import { Post, PostGraph } from '@/types';
import { cache } from 'react';
import 'server-only';

export const preload = (posts: Post[]) => {
  void getPostGraphFromPosts(posts);
};

export const getPostGraphFromPosts = cache(
  async (posts: Post[]): Promise<PostGraph> => {
    console.log('get post graph from posts');
    const postGraphLinks: Set<string> = new Set();
    const ids = posts.map(p => p.id);

    for (const post of posts) {
      const { forwardLinks, backlinks, id } = post;
      for (const fl of forwardLinks) {
        if (ids.includes(fl)) {
          postGraphLinks.add(
            JSON.stringify({
              source: id,
              target: fl,
            }),
          );
        }
      }

      for (const bl of backlinks) {
        if (ids.includes(bl)) {
          postGraphLinks.add(
            JSON.stringify({
              source: bl,
              target: id,
            }),
          );
        }
      }
    }

    return {
      nodes: posts,
      links: Array.from(postGraphLinks).map(str => JSON.parse(str)),
    };
  },
);
