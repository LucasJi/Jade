/* eslint-disable no-console */
import {
  ACCEPTED_FILE_FORMATS,
  IDS,
  MD_EXT,
  POST_ID,
  POST_PATH,
  POSTS_TREE,
  RK_ID,
  SEP,
} from '@/lib/constants';
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
import path, { join } from 'path';
import { Node, visit } from 'unist-util-visit';

const { dir } = env;

const loadRemoteVaultFilePathItems = (): Promise<PathItem[]> => getGitTree();

const loadLocalVaultFilePathItems = (
  dir: string,
  root: string,
  excludedPaths: string[],
  pathItems: PathItem[] = [],
): PathItem[] => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const absolutePath = join(dir, file);
    if (fs.statSync(absolutePath).isDirectory()) {
      if (excludedPaths.includes(file)) {
        continue;
      }
      loadLocalVaultFilePathItems(absolutePath, root, excludedPaths, pathItems);
    } else {
      const ext = path.extname(file);
      if (ACCEPTED_FILE_FORMATS.includes(ext)) {
        const relativePath = absolutePath.replace(root + SEP, '');
        pathItems.push({
          id: relativePath,
          path: relativePath,
          type: 'blob',
          ext,
        });
      }
    }
  }

  return pathItems;
};

const loadVaultFilePathItems = async () =>
  dir.root
    ? loadLocalVaultFilePathItems(dir.root, dir.root, dir.excluded)
    : loadRemoteVaultFilePathItems();

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

const loadVault = async () => {
  const redis = getRedisClient();
  const jadeKeys = await redis.keys('jade:*');
  jadeKeys.forEach(key => {
    redis.del(key);
  });
  const existIds = new Set<string>();
  const posts: Post[] = [];

  const pathItems = await loadVaultFilePathItems();

  for (const item of pathItems) {
    const { path, ext } = item;
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
    redis.set(`${RK_ID}${id}`, JSON.stringify(item));

    if (ext === MD_EXT) {
      const post = await loadPost(path, id);
      posts.push(post);
    }
  }

  // cache ids
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
};

const init = async () => {
  console.log('initializing jade...');
  const begin = new Date().getTime();

  await loadVault();

  console.log('jade initialized in', new Date().getTime() - begin, 'ms');
};

await init();
