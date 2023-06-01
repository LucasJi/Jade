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

  const slugs = [];
  const wikilinkNode: Node[] = [];
  const posts: Array<Post | null> = [];
  const postFullPaths = walkPosts();

  postFullPaths.forEach(p => {
    const slug = getSlugFromFullPath(p);
    slugs.push(slug);

    const post = getPostBySlug(slug);
    posts.push(post);
  });

  posts
    .filter(post => post !== null)
    .forEach(post => {
      const tree = fromMarkdown(post.content, {
        extensions: [syntax()],
        mdastExtensions: [remarkFromMarkdown()],
      });

      console.log('tree', tree);

      visit(tree, 'wikilink', node => {
        console.log(node);
        wikilinkNode.push(node);
      });
    });

  res.status(200).json(wikilinkNode);
}
