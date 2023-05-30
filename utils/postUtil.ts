import fs from 'fs';
import { join } from 'path';
import { Post } from './typeUtil';

const SEPARATOR = '/';
const TITLE_REG = /^#\s+.+/;
const postsDirectory = join(process.cwd(), '_posts', SEPARATOR);

export function getPostSlugs() {
  const fileFullPaths = walkFilesRecursively(postsDirectory);
  const slugs = fileFullPaths.map(fullPath => getSlugFromFullPath(fullPath));
  return slugs;
}

const getSlugFromFullPath = (fullPath: string) => {
  const relativePath = fullPath.replace(postsDirectory, '');
  const slug = relativePath.split(SEPARATOR);
  slug[slug.length - 1] = slug[slug.length - 1].replace(/\.md$/, '');
  return slug;
};

function walkFilesRecursively(dir: string, fileNameArray: string[] = []) {
  const files = fs.readdirSync(dir);
  let innerFileNameArray = fileNameArray || [];

  files.forEach(file => {
    const path = join(dir, file);
    if (fs.statSync(path).isDirectory()) {
      innerFileNameArray = walkFilesRecursively(path, innerFileNameArray);
    } else {
      innerFileNameArray.push(path);
    }
  });

  return innerFileNameArray;
}

const getFullPathFromSlug = (slug: string[]) => {
  slug[slug.length - 1] = slug[slug.length - 1] + '.md';
  const fullPath = join(postsDirectory, ...slug);
  return fullPath;
};

export function getPostBySlug(slug: string[]) {
  if (slug === undefined || slug.length === 0) {
    return null;
  }

  const fullPath = getFullPathFromSlug(slug);
  const content = fs.readFileSync(fullPath, 'utf8');
  const title = getTitle(content);
  const post: Post = {
    wikilink: join(...slug),
    slug,
    content,
    title,
  };
  return post;
}

const getTitle = (content: string) => {
  const tokens = content.split('\n');
  let title = tokens.find(token => TITLE_REG.test(token)) || '';
  // '# Title Demo' => 'Title Demo'
  title = title.replace('#', '').trim();
  return title;
};
