import fs from 'fs';
import { join } from 'path';
import { cache } from 'react';
import 'server-only';
import { getRelativePathFromAbsolutePath } from './common';
import { POST_DIR } from './constants';

export const preload = () => {
  void getWikilinks();
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

export const getWikilinks = cache(async (): Promise<string[]> => {
  console.log('get wikilinks');
  const absolutePaths = getMarkdownAbsolutePaths(POST_DIR);
  return absolutePaths.map(absolutePath =>
    getRelativePathFromAbsolutePath(absolutePath),
  );
});
