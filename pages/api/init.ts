import type { NextApiRequest, NextApiResponse } from 'next';
import { Post } from '@utils/typeUtil';
import { getPostBySlug, getSlugFromFullPath, walkPosts } from '@utils/postUtil';
import { createRedisInstance } from 'redis';
import { fromMarkdown } from 'mdast-util-from-markdown';
import {
  fromMarkdown as remarkFromMarkdown,
  syntax,
} from '@utils/remark-wikilink';
import { visit } from 'unist-util-visit';

// this api is used to initialize the state of all posts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405);
    res.statusMessage = 'only supports POST method';
    return;
  }

  const redis = createRedisInstance();

  const posts: Array<Post> = [];
  const postFullPaths = walkPosts();

  postFullPaths.forEach(p => {
    const slug = getSlugFromFullPath(p);
    console.log('slug', slug);
    const post = getPostBySlug(slug);
    if (post !== null) {
      posts.push(post);
    }
  });

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

  res.status(200).json(posts);
}
