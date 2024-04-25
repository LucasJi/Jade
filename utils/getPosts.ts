import { Post } from '@/types';
import { fromMarkdownWikilink, syntax } from '@lib/remark-wikilink';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { cache } from 'react';
import 'server-only';
import { visit } from 'unist-util-visit';
import { getPostById } from './getPostById';
import { getPostIds } from './getPostIds';

export const preload = () => {
  void getPosts();
};

const resolveWikilinks = (posts: Post[]) => {
  const findPostById = (id: string): Post | undefined => {
    return posts.find(p => p.id === id);
  };

  for (const post of posts) {
    if (post !== null) {
      const tree = fromMarkdown(post.content, {
        extensions: [syntax()],
        mdastExtensions: [fromMarkdownWikilink()],
      });

      const forwardLinks: Set<string> = new Set();

      visit(tree, 'wikilink', node => {
        const { value }: { value: string } = node;
        const post = posts.find(post =>
          post.wikilink.includes(value.split('#')[0]),
        );
        if (post) {
          forwardLinks.add(post.id);
        }
      });

      post.forwardLinks = Array.from(forwardLinks);

      for (const fl of forwardLinks) {
        const fp = findPostById(fl);
        if (fp) {
          const bls = new Set(fp.backlinks);
          bls.add(post.id);
          fp.backlinks = Array.from(bls);
        }
      }
    }
  }
};

export const getPosts = cache(async (): Promise<Post[]> => {
  console.log('get posts');
  const posts: Array<Post> = [];
  const ids = await getPostIds();

  for (const id of ids) {
    const post = await getPostById(id);
    if (!post) {
      continue;
    }

    posts.push(post);
  }

  resolveWikilinks(posts);

  return posts;
});
