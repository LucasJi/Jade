/* eslint-disable no-console */
import fs from 'fs';
import { Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toc } from 'mdast-util-toc';
import { join } from 'path';
import { revalidateTag } from 'next/cache';
import { PathItem, Post, PostGraph, TreeNode } from '@types';
import { fromMarkdownWikilink, syntax } from '@/plugins/remark-wikilink';
import { visit } from 'unist-util-visit';
import remarkFrontmatter from 'remark-frontmatter';
import { remark } from 'remark';
import { matter } from 'vfile-matter';
import {
  IGNORED_DIRS,
  MD_EXT,
  MD_EXT_REG,
  MD_HEADING_REG,
  MD_TITLE_REG,
  POST_HOME,
  SEP,
} from '@/lib/constants';

// env variables
const includeDirs: string[] = process.env.INCLUDE_DIRS?.split(',') || [];
const branch = process.env.GITHUB_BRANCH;
const POST_DIR = join(process.cwd(), '_posts', SEP);

// caches
export let idPathMap: null | Map<string, string> = null;
let cachedPostTree: null | TreeNode[] = null;
const pathPostMap = new Map<string, Post>();
let cachedPosts: null | Post[] = null;
let cachedPathItems: null | PathItem[] = null;

export const githubRequest = (url: string, tag: string = '') =>
  fetch(
    `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}${url}`,
    {
      // cache: 'no-cache',
      headers: {
        Accept: 'application/vnd.github.object+json',
        Authorization: 'Bearer ' + process.env.GITHUB_REPO_ACCESS_TOKEN!,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      next: {
        tags: [tag],
      },
    },
  )
    .then(async resp => {
      if (resp.status !== 200) {
        const msg = await resp.text();
        console.error('github api request failed', resp.status, msg);
        throw new Error('github api request failed: ' + msg);
      }
      return resp.json();
    })
    .catch(e => {
      console.error('github api request failed', e);
      revalidateTag(tag);
    });

export const getGitTree = async (): Promise<PathItem[]> => {
  return githubRequest(`/git/trees/${branch}?recursive=1`).then(data => {
    const { tree }: { tree: any[] } = data;
    return tree.filter(value =>
      includeDirs.length <= 0
        ? value.type === 'blob' && value.path.endsWith(MD_EXT)
        : value.type === 'blob' &&
          value.path.endsWith(MD_EXT) &&
          includeDirs.find(predicate => value.path.includes(predicate)),
    );
  });
};

// TODO delete
export const getRelativePathFromAbsolutePath = (
  absolutePath: string,
): string => {
  return absolutePath.replace(POST_DIR, '').replace(MD_EXT_REG, '');
};

export const getIdFromAbsolutePath = (absolutePath: string): string => {
  const relativePath = getRelativePathFromAbsolutePath(absolutePath);
  return base64Encode(relativePath);
};

const getLocalPostPaths = (
  dir: string = POST_HOME,
  pathItems: PathItem[] = [],
): PathItem[] => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const path = join(dir, file);
    if (fs.statSync(path).isDirectory()) {
      if (IGNORED_DIRS.includes(file)) {
        continue;
      }

      // const relativePath = path.replace(POST_HOME + SEP, '');
      // pathItems.push({
      //   path: relativePath,
      //   type: 'tree',
      // });

      getLocalPostPaths(path, pathItems);
    } else if (file.endsWith('.md')) {
      const relativePath = path.replace(POST_HOME + SEP, '');
      pathItems.push({
        path: relativePath,
        type: 'blob',
      });
    }
  }

  return pathItems;
};

const buildPostTree = (paths: PathItem[]): TreeNode[] => {
  const tree: TreeNode = {
    name: 'root',
    children: [],
    isDir: true,
  };

  paths.forEach(item => {
    const pathParts = item.path.split(SEP);
    const dirs: string[] = pathParts.slice(0, -1);
    let currentNode = tree;

    // find or create nodes for directories
    dirs.forEach(dir => {
      let dirNode = currentNode.children.find(
        node => node.name === dir && node.isDir,
      );

      if (!dirNode) {
        dirNode = {
          name: dir,
          children: [],
          isDir: true,
        };

        currentNode.children.push(dirNode);
      }

      currentNode.children.sort((a, b) => {
        if (a.isDir && !b.isDir) {
          return -1;
        } else if (!a.isDir && b.isDir) {
          return 1;
        }
        return a.name.localeCompare(b.name);
      });

      currentNode = dirNode;
    });

    if (item.type === 'tree') {
      const childDir = pathParts[pathParts.length - 1];
      currentNode.children.push({
        name: childDir,
        children: [],
        isDir: true,
      });
    }

    if (item.type === 'blob') {
      const file: string = pathParts[pathParts.length - 1];
      currentNode.children.push({
        id: item.id,
        name: file.replace(MD_EXT_REG, ''),
        children: [],
        isDir: false,
      });
    }
  });

  return tree.children;
};

export const removeTitle = (content: string) => {
  const tokens = content.split('\n');
  const restTokens = tokens
    .filter(token => !MD_TITLE_REG.test(token))
    .filter(token => MD_HEADING_REG.test(token));
  return restTokens.join('\n');
};

export const getPostToc = (content: string) => {
  const tree = fromMarkdown(removeTitle(content)) as Root;
  const result = toc(tree);
  const map = result.map;

  if (!map) {
    return [];
  }

  return map.children;
};

export const base64Encode = (text: string) => {
  return Buffer.from(text).toString('base64');
};

export const base64Decode = (text: string) => {
  return Buffer.from(text, 'base64').toString();
};

const getPostPaths = async (): Promise<PathItem[]> => {
  if (cachedPathItems) {
    console.log('get post paths from cache');
    return cachedPathItems;
  }

  let paths;
  if (POST_HOME) {
    paths = getLocalPostPaths();
  } else {
    paths = await getGitTree();
  }

  idPathMap = new Map<string, string>();

  for (const item of paths) {
    let hash = murmurhash(item.path);
    let id = decimalToBase62(hash);

    if (idPathMap!.has(id)) {
      hash = murmurhash(item.path + 'DUPLICATED');
      id = decimalToBase62(hash);
    }

    item.id = id;

    idPathMap!.set(id, item.path);

    await readAndCachePost(item.path, id);
  }

  cachedPathItems = paths;

  return paths;
};

export const getPostTree = async (): Promise<TreeNode[]> => {
  if (cachedPostTree) {
    console.log('get post tree from cache');
    return cachedPostTree;
  }

  const pathItems = await getPostPaths();

  cachedPostTree = buildPostTree(pathItems);

  return cachedPostTree;
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
  if (cachedPosts) {
    return cachedPosts;
  }

  await getPostIds();

  cachedPosts = [...pathPostMap.values()];

  return cachedPosts;
};

export const getIdPathMap = () => {
  return idPathMap || new Map();
};

export const getPostIds = async (): Promise<string[]> => {
  if (idPathMap) {
    console.log('get post ids from cache');
    return [...idPathMap.keys()];
  }

  await getPostPaths();

  resolveWikilinks([...pathPostMap.values()]);

  return [...idPathMap!.keys()];
};

const getPathById = async (id: string): Promise<string> => {
  if (!idPathMap) {
    await getPostIds();
  }

  return Promise.resolve(idPathMap!.get(id) || '');
};

let globalPostGraph: PostGraph | null = null;

export const getGlobalPostGraph = async (): Promise<PostGraph> => {
  if (globalPostGraph) {
    return Promise.resolve(globalPostGraph);
  }

  return getPosts().then(posts =>
    getPostGraphFromPosts(posts).then(postGraph => {
      globalPostGraph = postGraph;
      return postGraph;
    }),
  );
};

export const getPostGraphFromPosts = async (
  posts: Post[],
): Promise<PostGraph> => {
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

    // for (const bl of backlinks) {
    //   if (ids.includes(bl)) {
    //     postGraphLinks.add(
    //       JSON.stringify({
    //         source: bl,
    //         target: id,
    //       }),
    //     );
    //   }
    // }
  }

  return {
    nodes: posts.map(post => ({
      ...post,
      content: '',
      frontmatter: undefined,
    })),
    links: Array.from(postGraphLinks).map(str => JSON.parse(str)),
  };
};

// convert frontmatter to metadata, see: https://github.com/remarkjs/remark-frontmatter?tab=readme-ov-file#example-frontmatter-as-metadata
function frontYamlMatterHandler() {
  return function (tree: any, file: any) {
    matter(file);
  };
}

const DEFAULT_MD_PROCESSOR = remark()
  .use(remarkFrontmatter, ['yaml'])
  .use(frontYamlMatterHandler);

export const resolvePost = (
  post: string,
  filename: string,
): { title: string; frontmatter: { [key: string]: any } | undefined } => {
  let title: string = '';

  // try to get title from frontmatter
  const frontmatter: { [key: string]: any } | undefined = {};
  try {
    // const postVFile = DEFAULT_MD_PROCESSOR.processSync(post);
    // frontmatter = postVFile.data.matter as undefined | { [key: string]: any };
    // title = frontmatter?.title;
  } catch (e) {
    // do nothing
  }

  // try to get title from heading `#`
  // if (!title) {
  //   const root = DEFAULT_MD_PROCESSOR.parse(post);
  //   const titleHeadingIdx = root.children.findIndex(
  //     node => node.type === 'heading' && node.depth === 1,
  //   );
  //   if (titleHeadingIdx !== -1) {
  //     const titleHeadingNode = root.children[titleHeadingIdx] as Heading;
  //     const textNode = titleHeadingNode.children.find(
  //       child => child.type === 'text',
  //     ) as Text;
  //     title = textNode.value;
  //   }
  // }

  // use file name as title
  if (!title) {
    title = filename.replace(MD_EXT_REG, '');
  }

  return { title, frontmatter };
};

const readAndCachePost = async (
  path: string,
  id: string,
): Promise<Post | null> => {
  try {
    let file;
    if (POST_HOME) {
      file = fs.readFileSync(join(POST_HOME, path), 'utf8');
    } else {
      file = await githubRequest(`/contents/${path}`, `post:${id}`);
    }
    // resolve emoji base64 decoding problem
    const content = POST_HOME ? file : base64Decode(file.content);
    const filenameSplits = path.split(SEP);
    const filename = filenameSplits[filenameSplits.length - 1];
    const { title, frontmatter } = resolvePost(content, filename);
    const post = {
      id,
      content: content,
      title,
      frontmatter,
      forwardLinks: [],
      backlinks: [],
      ctime: new Date(),
    };

    pathPostMap.set(path, post);

    return post;
  } catch (e) {
    console.error('get post by path error', path, e);
    return null;
  }
};

export const getPostById = async (id: string): Promise<Post | null> => {
  const path = await getPathById(id);

  if (pathPostMap.has(path)) {
    return pathPostMap.get(path)!;
  }

  return readAndCachePost(path, id);
};

export const getAdjacencyPostsById = async (id: string): Promise<Post[]> => {
  const posts = await getPosts();
  return posts.filter(
    p => p.id === id || p.backlinks.includes(id) || p.forwardLinks.includes(id),
  );
};

/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
export const murmurhash = (key: string, seed: number = 965): number => {
  const remainder = key.length & 3, // key.length % 4
    bytes = key.length - remainder,
    c1 = 0xcc9e2d51,
    c2 = 0x1b873593;

  let i = 0,
    k1,
    h1b,
    h1 = seed;

  while (i < bytes) {
    k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(++i) & 0xff) << 8) |
      ((key.charCodeAt(++i) & 0xff) << 16) |
      ((key.charCodeAt(++i) & 0xff) << 24);
    ++i;

    k1 =
      ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 =
      ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1b =
      ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
    h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
  }

  k1 = 0;

  switch (remainder) {
    case 3:
      k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
      break;
    case 2:
      k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
      break;
    case 1:
      k1 ^= key.charCodeAt(i) & 0xff;
      k1 =
        ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) &
        0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 =
        ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) &
        0xffffffff;
      h1 ^= k1;
  }

  h1 ^= key.length;

  h1 ^= h1 >>> 16;
  h1 =
    ((h1 & 0xffff) * 0x85ebca6b +
      ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) &
    0xffffffff;
  h1 ^= h1 >>> 13;
  h1 =
    ((h1 & 0xffff) * 0xc2b2ae35 +
      ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) &
    0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
};

export const decimalToBase62 = (decimal: number): string => {
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let base62 = '';

  if (decimal === 0) {
    return '0';
  }

  while (decimal > 0) {
    base62 = charset[decimal % 62] + base62;
    decimal = Math.floor(decimal / 62);
  }

  return base62;
};
