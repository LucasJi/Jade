import fs from 'fs';
import { Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toc } from 'mdast-util-toc';
import { join } from 'path';
import {
  MD_HEADING_REG,
  MD_SUFFIX_REG,
  MD_TITLE_REG,
  POST_DIR,
} from './constants';
import { revalidateTag } from 'next/cache';

export const githubRequest = (url: string, tag: string = '') =>
  fetch(
    `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}${url}`,
    {
      cache: 'no-cache',
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

// TODO delete
export const getRelativePathFromAbsolutePath = (
  absolutePath: string,
): string => {
  return absolutePath.replace(POST_DIR, '').replace(MD_SUFFIX_REG, '');
};

export const getIdFromAbsolutePath = (absolutePath: string): string => {
  const relativePath = getRelativePathFromAbsolutePath(absolutePath);
  return base64Encode(relativePath);
};

// TODO delete
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

export const base64Encode = (text: string) => {
  return Buffer.from(text).toString('base64');
};

export const base64Decode = (text: string) => {
  return Buffer.from(text, 'base64').toString();
};
