import { Post } from '@/types';
import { fromMarkdownWikilink, syntax } from '@/plugin/remark-wikilink';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { visit } from 'unist-util-visit';
import { base64Decode } from './common';
import { getPostById } from './getPostById';
import { getPostIds } from './getPostIds';

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
        const post = posts.find(post => {
          const path = base64Decode(post.id);
          return path.includes(value.split('#')[0]);
        });
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

export const getPosts = async (): Promise<Post[]> => {
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
};
