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

export function encode(value: string) {
  return Buffer.from(value, 'utf-8').toString('base64');
}

export function decode(value: string) {
  return Buffer.from(value, 'base64').toString('utf-8');
}

export const getWikilinks = (): string[] => {
  const absolutePaths = getMarkdownAbsolutePaths(POST_DIR);
  return absolutePaths.map(absolutePath =>
    getWikilinkFromAbsolutePath(absolutePath),
  );
};

const getWikilinkFromAbsolutePath = (absolutePath: string): string => {
  const relativePath = absolutePath.replace(POST_DIR, '');
  return encode(relativePath);
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
        id: getWikilinkFromAbsolutePath(path),
        name: file,
        children: [],
      };
      node.children = _getPostTree(path, node.children);
      postTree.push(node);
    } else if (file.endsWith('.md')) {
      postTree.push({
        id: getWikilinkFromAbsolutePath(path),
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

export const getPostByWikilink = (wikilink: string) => {
  const relativePath = decode(wikilink);
  const fullPath = POST_DIR + SEPARATOR + relativePath;
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const title = getTitle(content);
    const post: Post = {
      wikilink,
      content,
      title,
      forwardLinks: [],
      backlinks: [],
      href: `${relativePath}`,
    };
    return post;
  } catch (e) {
    return null;
  }
};

export const getPosts = (): Post[] => {
  const posts: Array<Post> = [];
  const wikilinks = getWikilinks();
  console.log(wikilinks);
  const relativeFolderSet = new Set<string>();
  for (const Wikilink of wikilinks) {
    relativeFolderSet.add(getRelativeParentFolderFromWikilink(Wikilink));
  }

  for (const Wikilink of wikilinks) {
    const post = getPostByWikilink(Wikilink);
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
  const wikilinks = posts.map(p => p.wikilink);

  for (const post of posts) {
    const { forwardLinks, backlinks, wikilink } = post;
    for (const fl of forwardLinks) {
      if (wikilinks.includes(fl)) {
        postGraphLinks.push({
          source: wikilink,
          target: fl,
        });
      }
    }

    for (const bl of backlinks) {
      if (wikilinks.includes(bl)) {
        postGraphLinks.push({
          source: bl,
          target: wikilink,
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
  const findPostByWikilink = (wikilink: string): Post | undefined => {
    return posts.find(p => p.wikilink === wikilink);
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
        forwardLinks.add(value);
      });

      post.forwardLinks = Array.from(forwardLinks);

      for (const fl of forwardLinks) {
        const fp = findPostByWikilink(fl);
        if (fp) {
          const bls = new Set(fp.backlinks);
          bls.add(post.wikilink);
          fp.backlinks = Array.from(bls);
        }
      }
    }
  }
};

const getRelativeParentFolderFromWikilink = (wikilink: string): string =>
  decode(wikilink)
    .split(SEPARATOR)
    .slice(0, decode(wikilink).split(SEPARATOR).length - 1)
    .join(SEPARATOR);
