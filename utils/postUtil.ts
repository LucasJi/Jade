import fs from 'fs';
import { join } from 'path';

const SEPARATOR = '/';
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
  const fullPath = getFullPathFromSlug(slug);
  const content = fs.readFileSync(fullPath, 'utf8');
  const post: Post = {
    slug,
    content,
  };
  return post;
}

export type Post = {
  slug: string[];
  content: string;
};
