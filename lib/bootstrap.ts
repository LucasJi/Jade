/* eslint-disable no-console */
import { IDS, POST_ID, POST_PATH, POSTS_TREE, SEP } from '@/lib/constants';
import { env } from '@/lib/env';
import { getGitTree, githubRequest } from '@/lib/github-utils';
import { getRedisClient } from '@/lib/redis-utils';
import {
  base64Decode,
  buildPostsTree,
  decimalToBase62,
  murmurhash,
  parseNote,
} from '@/lib/server-utils';
import {
  fromWikilinkMarkdown,
  wikilinkSyntax,
} from '@/plugins/remark-wikilink';
import { PathItem, Post } from '@types';
import fs from 'fs';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { join } from 'path';
import { Node, visit } from 'unist-util-visit';

const { dir } = env;

const getOnlinePostPaths = () => getGitTree();

const getLocalPostPaths = (
  dir: string,
  root: string,
  excludedPaths: string[],
  pathItems: PathItem[] = [],
): PathItem[] => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const path = join(dir, file);
    if (fs.statSync(path).isDirectory()) {
      if (excludedPaths.includes(file)) {
        continue;
      }
      getLocalPostPaths(path, root, excludedPaths, pathItems);
    } else if (file.endsWith('.md')) {
      const relativePath = path.replace(root + SEP, '');
      pathItems.push({
        id: relativePath,
        path: relativePath,
        type: 'blob',
      });
    }
  }

  return pathItems;
};

const getPostPaths = async () =>
  dir.root
    ? getLocalPostPaths(dir.root, dir.root, dir.excluded)
    : getOnlinePostPaths();

const loadPost = async (path: string, id: string): Promise<Post> => {
  try {
    let file;
    if (dir.root) {
      file = fs.readFileSync(join(dir.root, path), 'utf8');
    } else {
      file = await githubRequest(`/contents/${path}`, `post:${id}`);
    }
    // base64Decode: resolve emoji base64 decoding problem
    const content = dir.root ? file : base64Decode(file.content);
    const filenameSplits = path.split(SEP);
    const filename = filenameSplits[filenameSplits.length - 1];
    const { title, frontmatter } = parseNote(content, filename);

    return {
      id,
      content: content,
      title,
      frontmatter,
      forwardLinks: [],
      backlinks: [],
      path,
    };
  } catch (e) {
    console.error('load post failed with path:', path, e);
    throw e;
  }
};

const resolveWikilinks = async (posts: Post[]) => {
  const findPostById = (id: string): Post | undefined => {
    return posts.find(p => p.id === id);
  };

  for (const post of posts) {
    if (post !== null) {
      const tree = fromMarkdown(post.content, {
        extensions: [wikilinkSyntax()],
        mdastExtensions: [fromWikilinkMarkdown()],
      });

      const forwardLinks: Set<string> = new Set();

      visit(tree as Node, 'wikilink', node => {
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

const init = async () => {
  console.log('initializing jade...');

  const begin = new Date().getTime();
  const existIds = new Set<string>();
  const posts: Post[] = [];
  const redis = getRedisClient();

  const jadeKeys = await redis.keys('jade:*');
  jadeKeys.forEach(key => {
    redis.del(key);
  });

  const pathItems = await getPostPaths();

  for (const item of pathItems) {
    const { path } = item;
    let hash = murmurhash(path);
    let id = decimalToBase62(hash);

    if (existIds.has(id)) {
      hash = murmurhash(item.path + 'DUPLICATED');
      id = decimalToBase62(hash);
    }
    existIds.add(id);

    item.id = id;

    // cache path
    redis.set(`${POST_PATH}${path}`, id);

    const post = await loadPost(path, id);
    posts.push(post);
  }

  // cache post ids
  redis.sadd(IDS, [...existIds.values()]);

  await resolveWikilinks(posts);

  // cache posts
  for (const post of posts) {
    const key = `${POST_ID}${post.id}`;
    redis.set(key, JSON.stringify(post));
  }

  const postsTree = buildPostsTree(pathItems);

  // cache posts tree
  redis.set(POSTS_TREE, JSON.stringify(postsTree));

  console.log('jade initialized in', new Date().getTime() - begin, 'ms');
};

await init();
