import fs from 'fs';
import { join } from 'path';
import { Post, Slug } from './typeUtil';

const SEPARATOR = '/';
const TITLE_REG = /^#\s+.+/;
export const POST_DIR = join(process.cwd(), '_posts', SEPARATOR);

export function getPostSlugs() {
  const fileFullPaths = walkFilesRecursively(POST_DIR);
  const slugs = fileFullPaths.map(fullPath => getSlugFromFullPath(fullPath));
  return slugs;
}

export const getSlugFromFullPath = (fullPath: string) => {
  const relativePath = fullPath.replace(POST_DIR, '');
  const slug = relativePath.split(SEPARATOR);
  // someFolder/post.md -> ['someFolder', 'post.md'] -> ['someFolder', 'post']
  slug[slug.length - 1] = slug[slug.length - 1].replace(/\.md$/, '');
  return slug;
};

export function walkFilesRecursively(
  dir: string,
  fileNameArray: string[] = [],
) {
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

export function walkPosts() {
  return walkFilesRecursively(POST_DIR);
}

const getFullPathFromSlug = (slug: string[]) => {
  const slugClone = [...slug];
  slugClone[slugClone.length - 1] = slugClone[slugClone.length - 1] + '.md';
  const fullPath = join(POST_DIR, ...slugClone);
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
    forwardWikilinks: [],
    backWikilinks: [],
  };

  return post;
}

export function getWikilinkFromSlug(slug: Slug) {
  return join(...slug);
}

const getTitle = (content: string) => {
  const tokens = content.split('\n');
  let title = tokens.find(token => TITLE_REG.test(token)) || '';
  // '# Title Demo' => 'Title Demo'
  title = title.replace('#', '').trim();
  return title;
};
