import fs from 'fs';
import { Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toc } from 'mdast-util-toc';
import { join } from 'path';
import { TreeNode } from 'types';
import {
  MD_HEADING_REG,
  MD_SUFFIX_REG,
  MD_TITLE_REG,
  POST_DIR,
} from './constants';

export const getRelativePathFromAbsolutePath = (
  absolutePath: string,
): string => {
  return absolutePath.replace(POST_DIR, '').replace(MD_SUFFIX_REG, '');
};

export const getIdFromAbsolutePath = (absolutePath: string): string => {
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
        isDir: true,
      };
      node.children = _getPostTree(path, node.children);
      if (node.children.length > 0) {
        postTree.push(node);
      }
    } else if (file.endsWith('.md')) {
      postTree.push({
        id: getIdFromAbsolutePath(path),
        name: file.replace(/\.md$/, ''),
        isDir: false,
      });
    }
  }

  postTree.sort((a, b) => {
    if (a.isDir && !b.isDir) {
      return -1;
    } else if (!a.isDir && b.isDir) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });

  return postTree;
};

export const getMarkdownAbsolutePaths = (
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
