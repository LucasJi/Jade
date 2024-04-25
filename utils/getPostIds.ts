import fs from 'fs';
import { join } from 'path';
import { cache } from 'react';
import 'server-only';
import { getIdFromAbsolutePath } from './common';
import { POST_DIR } from './constants';

export const preload = () => {
  void getPostIds();
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

export const getPostIds = cache(async (): Promise<string[]> => {
  console.log('get post ids');
  const absolutePaths = getMarkdownAbsolutePaths(POST_DIR);
  return absolutePaths.map(absolutePath => getIdFromAbsolutePath(absolutePath));
});
