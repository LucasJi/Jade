import { fromMarkdownWikilink, syntax } from '@utils/remark-wikilink';
import fs from 'fs';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { join } from 'path';
import { Post, PostGraph, PostGraphLink, TreeNode } from 'types';
import { visit } from 'unist-util-visit';

const SEPARATOR = '/';
// find markdown mark "#"
const TITLE_REG = /^#\s+.+/;
const MD_SUFFIX_REG = /\.md$/;

export const POST_DIR = join(process.cwd(), '_posts', SEPARATOR);

export const getIds = (): string[] => {
  const absolutePaths = getMarkdownAbsolutePaths(POST_DIR);
  return absolutePaths.map(absolutePath => getIdFromAbsolutePath(absolutePath));
};

const getIdFromAbsolutePath = (absolutePath: string): string => {
  const relativePath = absolutePath
    .replace(POST_DIR, '')
    .replace(MD_SUFFIX_REG, '');
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
      postTree.push(node);
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

const getTitle = (content: string) => {
  const tokens = content.split('\n');
  let title = tokens.find(token => TITLE_REG.test(token)) || '';
  // '# Title Demo' => 'Title Demo'
  title = title.replace('#', '').trim();
  return title;
};

export const getPostById = (id: string) => {
  const relativePath = atob(id);
  const fullPath = POST_DIR + SEPARATOR + relativePath + '.md';
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const title = getTitle(content);
    const post: Post = {
      id,
      wikilink: relativePath,
      content,
      title,
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
  const postGraphLinks: PostGraphLink[] = [];
  const ids = posts.map(p => p.id);

  for (const post of posts) {
    const { forwardLinks, backlinks, id } = post;
    for (const fl of forwardLinks) {
      if (ids.includes(id)) {
        postGraphLinks.push({
          source: id,
          target: fl,
        });
      }
    }

    for (const bl of backlinks) {
      if (ids.includes(id)) {
        postGraphLinks.push({
          source: bl,
          target: id,
        });
      }
    }
  }

  return { nodes: posts, links: postGraphLinks };
};

export const getAdjacencyPosts = (post: Post) => {
  const posts = getPosts();
  return posts.filter(
    e =>
      e.wikilink === post.wikilink ||
      e.backlinks.includes(post.wikilink) ||
      e.forwardLinks.includes(post.wikilink),
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
