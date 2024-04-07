import { fromMarkdownWikilink, syntax } from '@lib/remark-wikilink';
import fs from 'fs';
import { Heading, Root, Text } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toc } from 'mdast-util-toc';
import { join } from 'path';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import { Post, PostGraph, TreeNode } from 'types';
import { visit } from 'unist-util-visit';

const SEPARATOR = '/';
// find markdown mark "#"
const MD_TITLE_REG = /^#\s+.+/;
const MD_SUFFIX_REG = /\.md$/;
const MD_HEADING_REG = /^(#{1,6})\s+.+/;
const DEFAULT_MD_PROCESSOR = remark().use(remarkFrontmatter, ['yaml']);

export const POST_DIR = join(process.cwd(), '_posts', SEPARATOR);
// export const POST_DIR = '/home/lucas/docs';

export const getWikilinks = (): string[] => {
  const absolutePaths = getMarkdownAbsolutePaths(POST_DIR);
  return absolutePaths.map(absolutePath =>
    getRelativePathFromAbsolutePath(absolutePath),
  );
};

export const getIds = (): string[] => {
  const absolutePaths = getMarkdownAbsolutePaths(POST_DIR);
  return absolutePaths.map(absolutePath => getIdFromAbsolutePath(absolutePath));
};

const getRelativePathFromAbsolutePath = (absolutePath: string): string => {
  return absolutePath.replace(POST_DIR, '').replace(MD_SUFFIX_REG, '');
};

const getIdFromAbsolutePath = (absolutePath: string): string => {
  const relativePath = getRelativePathFromAbsolutePath(absolutePath);
  return btoa(relativePath);
};

export const getPostTree = () => {
  return _getPostTree(POST_DIR);
};

const _getPostTree = (dir: string, postTree: TreeNode[] = []) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const path = join(dir, file);
    if (fs.statSync(path).isDirectory()) {
      const node: TreeNode = {
        id: getIdFromAbsolutePath(path),
        name: file,
        children: [],
      };
      node.children = _getPostTree(path, node.children);
      if (node.children.length > 0) {
        postTree.push(node);
      }
    } else if (file.endsWith('.md')) {
      postTree.push({
        id: getIdFromAbsolutePath(path),
        name: file.replace(/\.md$/, ''),
      });
    }
  }

  return postTree;
};

const getMarkdownAbsolutePaths = (
  dir: string,
  absolutePaths: string[] = [],
) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const path = join(dir, file);
    if (fs.statSync(path).isDirectory()) {
      getMarkdownAbsolutePaths(path, absolutePaths);
    } else if (file.endsWith('.md')) {
      absolutePaths.push(path);
    }
  }

  return absolutePaths;
};

/**
 * The title of a post can be from three parts:
 * 1. The title field in the frontmatter.
 * 2. The string after the number sign `#`.
 * 3. The name of the post file.
 *
 * The part 1 has the highest priority, the part 2 has the last and the part 3 has the least.
 *
 * @param post markdown
 * @returns markdown
 */
export const resolvePost = (
  post: string,
  filename: string,
): { title: string; frontmatter: undefined | { [key: string]: any } } => {
  let title: string = '';

  // try to get title from frontmatter
  const postVFile = DEFAULT_MD_PROCESSOR.processSync(post);
  const frontmatter = postVFile.data.frontmatter as
    | undefined
    | { [key: string]: any };
  title = frontmatter?.title;

  // try to get title from heading `#`
  if (!title) {
    const root = DEFAULT_MD_PROCESSOR.parse(post);
    const titleHeadingIdx = root.children.findIndex(
      node => node.type === 'heading' && node.depth === 1,
    );
    if (titleHeadingIdx !== -1) {
      const titleHeadingNode = root.children[titleHeadingIdx] as Heading;
      const textNode = titleHeadingNode.children.find(
        child => child.type === 'text',
      ) as Text;
      title = textNode.value;
    }
  }

  // use file name as title
  if (!title) {
    title = filename;
  }

  return { title, frontmatter };
};

export const removeTitle = (post: string) => {
  const tokens = post.split('\n');
  const restTokens = tokens
    .filter(token => !MD_TITLE_REG.test(token))
    .filter(token => MD_HEADING_REG.test(token));
  return restTokens.join('\n');
};

export const getPostById = (id: string) => {
  const relativePath = atob(id);
  const fullPath = POST_DIR + SEPARATOR + relativePath + '.md';
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const filenameSplits = relativePath.split(SEPARATOR);
    const filename = filenameSplits[filenameSplits.length - 1];
    const { title, frontmatter } = resolvePost(content, filename);
    const post: Post = {
      id,
      wikilink: relativePath,
      content: content,
      title,
      frontmatter,
      forwardLinks: [],
      backlinks: [],
    };
    return post;
  } catch (e) {
    return null;
  }
};

export const getPosts = (): Post[] => {
  const posts: Array<Post> = [];
  const ids = getIds();

  for (const id of ids) {
    const post = getPostById(id);
    if (!post) {
      continue;
    }

    posts.push(post);
  }

  resolveWikilinks(posts);

  return posts;
};

export const getPostGraph = (): PostGraph => {
  const posts = getPosts();
  return generatePostGraphFromPosts(posts);
};

export const generatePostGraphFromPosts = (posts: Post[]) => {
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
};

export const getAdjacencyPosts = (post: Post) => {
  const posts = getPosts();
  return posts.filter(
    p =>
      p.id === post.id ||
      p.backlinks.includes(post.id) ||
      p.forwardLinks.includes(post.id),
  );
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
        const { value } = node;
        const post = posts.find(post => post.wikilink.includes(value));
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

export const getPostToc = (post: string) => {
  const tree = fromMarkdown(removeTitle(post)) as Root;
  const result = toc(tree);
  const map = result.map;

  if (!map) {
    return [];
  }

  return map.children;
};
