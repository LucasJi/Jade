/* eslint-disable no-console */
import { PathItem, Post, PostGraph, TreeNode } from '@types';
import { Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toc } from 'mdast-util-toc';
import * as os from 'node:os';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import { VFile } from 'vfile';
import { matter } from 'vfile-matter';
import { MD_EXT_REG, MD_HEADING_REG, MD_TITLE_REG, SEP } from './constants';

export const buildPostsTree = (paths: PathItem[]): TreeNode[] => {
  const tree: TreeNode = {
    id: 'root',
    name: 'root',
    children: [],
    isDir: true,
  };

  paths.forEach(item => {
    // 'a/b/c.md' => ['a', 'b', 'c.md'] or 'a/b/c' => ['a', 'b', 'c']
    const pathParts = item.path.split(SEP);
    // ['a', 'b']
    const dirs: string[] = pathParts.slice(0, -1);
    let currentNode = tree;

    /**
     * Use depth-first algorithm to find item's parent node. If the parent node doesn't exist, create it.
     *
     * Example: { id: 'root', isDir: true, children: [{id: 'a', isDir: true, children: [{id: 'b', isDir: true, children: []}]}]}.
     * If we want to create node with id 'c', we need to find/create node with id 'b' first. And, If
     * we want to find or create node with id 'b', we need to find/create node with id 'a' first. That's
     * why we use depth-first search.
     */
    dirs.forEach(dir => {
      let dirNode = currentNode.children.find(
        node => node.name === dir && node.isDir,
      );

      if (!dirNode) {
        dirNode = {
          id: dir,
          name: dir,
          children: [],
          isDir: true,
        };
        currentNode.children.push(dirNode);

        // sort all nodes after any new node added
        currentNode.children.sort((a, b) => {
          if (a.isDir && !b.isDir) {
            return -1;
          } else if (!a.isDir && b.isDir) {
            return 1;
          }
          return a.name.localeCompare(b.name, 'zh');
        });
      }

      currentNode = dirNode;
    });

    // c is a directory
    if (item.type === 'tree') {
      const childDir = pathParts[pathParts.length - 1];
      currentNode.children.push({
        id: childDir,
        name: childDir,
        children: [],
        isDir: true,
      });
    }

    // c is a markdown file
    if (item.type === 'blob') {
      const file: string = pathParts[pathParts.length - 1];
      currentNode.children.push({
        id: item.id,
        name: file.replace(MD_EXT_REG, ''),
        children: [],
        isDir: false,
      });
    }

    // sort all nodes after any new node added
    currentNode.children.sort((a, b) => {
      if (a.isDir && !b.isDir) {
        return -1;
      } else if (!a.isDir && b.isDir) {
        return 1;
      }
      return a.name.localeCompare(b.name, 'zh');
    });
  });

  return tree.children;
};

export const removeTitle = (content: string) => {
  const tokens = content.split(os.EOL);
  const restTokens = tokens
    .filter(token => !MD_TITLE_REG.test(token))
    .filter(token => MD_HEADING_REG.test(token));
  return restTokens.join(os.EOL);
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
    matter(file, { strip: true });
  };
}

const DEFAULT_MD_PROCESSOR = remark()
  .use(remarkFrontmatter)
  .use(frontYamlMatterHandler);

export const parseFrontMatter = (mdVFile: VFile) => {
  return DEFAULT_MD_PROCESSOR.process(mdVFile);
};

/**
 * Parse plain note with following steps:
 *  1. Parse frontmatter and remove it to custom frontmatter
 *  2. extract note title
 *  3. extract note content
 *  4. generate table of content(TOC)
 *
 * @param note markdown
 * @param filename markdown file name
 */
export const parseNote = (
  note: string,
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
