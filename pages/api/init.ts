import type { NextApiRequest, NextApiResponse } from 'next';
import { getPostBySlug, getSlugFromFullPath, walkPosts } from '@utils/postUtil';
import { redis } from '@utils/redisUtil';
import { fromMarkdown } from 'mdast-util-from-markdown';
import {
  fromMarkdown as remarkFromMarkdown,
  syntax,
} from '@utils/remark-wikilink';
import { visit } from 'unist-util-visit';
import { Post, Slug } from 'types';

// this api is used to read and store posts in redis
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405);
    res.statusMessage = 'only supports POST method';
    return;
  }

  const posts: Array<Post> = [];
  const slugs: Array<Slug> = [];
  const postFullPaths = walkPosts();

  postFullPaths.forEach(p => {
    const slug = getSlugFromFullPath(p);
    slugs.push(slug);
    const post = getPostBySlug(slug);
    if (post !== null) {
      posts.push(post);
    }
  });

  redis.set('slugs', JSON.stringify(slugs));

  posts.forEach(post => {
    if (post !== null) {
      const tree = fromMarkdown(post.content, {
        extensions: [syntax()],
        mdastExtensions: [remarkFromMarkdown()],
      });

      const forwardWikilinks: string[] = [];

      visit(tree, 'wikilink', node => {
        const { value } = node;
        forwardWikilinks.push(value);
      });

      post.forwardWikilinks = forwardWikilinks;

      redis.set(post.wikilink, JSON.stringify(post));
    }
  });

  redis.set('posts', JSON.stringify(posts));

  // TODO generate post graph

  res.status(200).json(posts);
}
