import fs from 'fs';
import { join } from 'path';
import { Post, Slug } from 'types';
import { redis } from './redisUtil';
import { fromMarkdown } from 'mdast-util-from-markdown';
import {
  fromMarkdown as remarkFromMarkdown,
  syntax,
} from '@utils/remark-wikilink';
import { visit } from 'unist-util-visit';

const SEPARATOR = '/';
const TITLE_REG = /^#\s+.+/;
export const POST_DIR = join(process.cwd(), '_posts', SEPARATOR);

export const getCachedSlugs = async (): Promise<Slug[]> => {
  const key = 'slugs';
  const slugsJson = await redis.get(key);

  let slugs: Array<Slug>;
  if (slugsJson === null) {
    slugs = getPostSlugs();
    redis.set(key, JSON.stringify(slugs));
  } else {
    slugs = JSON.parse(slugsJson);
  }

  return slugs;
};

const getPostSlugs = () => {
  const fileFullPaths = walkFilesRecursively(POST_DIR);
  const slugs = fileFullPaths.map(fullPath => getSlugFromFullPath(fullPath));
  return slugs;
};

const getSlugFromFullPath = (fullPath: string) => {
  const relativePath = fullPath.replace(POST_DIR, '');
  const slug = relativePath.split(SEPARATOR);
  // someFolder/post.md -> ['someFolder', 'post.md'] -> ['someFolder', 'post']
  slug[slug.length - 1] = slug[slug.length - 1].replace(/\.md$/, '');
  return slug;
};

const walkFilesRecursively = (dir: string, fileNameArray: string[] = []) => {
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
};

const getFullPathFromSlug = (slug: string[]) => {
  const slugClone = [...slug];
  slugClone[slugClone.length - 1] = slugClone[slugClone.length - 1] + '.md';
  const fullPath = join(POST_DIR, ...slugClone);
  return fullPath;
};

const getWikilinkFromSlug = (slug: Slug) => {
  return join(...slug);
};

const getTitle = (content: string) => {
  const tokens = content.split('\n');
  let title = tokens.find(token => TITLE_REG.test(token)) || '';
  // '# Title Demo' => 'Title Demo'
  title = title.replace('#', '').trim();
  return title;
};

export const getCachedPostBySlug = async (slug: Slug): Promise<Post> => {
  const wikilink = getWikilinkFromSlug(slug);
  let post = null;
  const postJson = await redis.get(wikilink);
  if (postJson !== null) {
    post = JSON.parse(postJson);
  } else {
    post = getPostBySlug(slug);
    redis.set(wikilink, JSON.stringify(post));
  }

  return post;
};

const getPostBySlug = (slug: string[]) => {
  if (slug === undefined || slug.length === 0) {
    return null;
  }

  const fullPath = getFullPathFromSlug(slug);
  const content = fs.readFileSync(fullPath, 'utf8');
  const title = getTitle(content);
  const wikilink = join(...slug);
  const post: Post = {
    wikilink,
    slug,
    content,
    title,
    forwardWikilinks: [],
    backWikilinks: [],
    href: `posts/${wikilink}`,
  };

  return post;
};

export const getCachedPosts = async (): Promise<Post[]> => {
  const posts: Array<Post> = [];
  const slugs = await getCachedSlugs();
  for (const slug of slugs) {
    const post = getPostBySlug(slug);
    if (post !== null) {
      posts.push(post);
    }
  }
  return posts;
};

export const initPosts = async (): Promise<Post[]> => {
  let posts = await getCachedPosts();
  await resolveWikilinks(posts);
  posts = await getCachedPosts();
  return posts;
};

const resolveWikilinks = async (posts: Post[]) => {
  for (const post of posts) {
    if (post !== null) {
      const tree = fromMarkdown(post.content, {
        extensions: [syntax()],
        mdastExtensions: [remarkFromMarkdown()],
      });

      const forwardWikilinks: string[] = [];

      visit(tree, 'wikilink', node => {
        const { value } = node;
        forwardWikilinks.push(value);
      });

      post.forwardWikilinks = forwardWikilinks;

      for (const fl of forwardWikilinks) {
        const fp = await getCachedPostBySlug(getSlugFromWikilink(fl));
        fp.backWikilinks.push(post.wikilink);
        updateCachedPost(fp.wikilink, fp);
      }
    }
  }
};

const updateCachedPost = (wikilink: string, post: Post) => {
  redis.set(wikilink, JSON.stringify(post));
};

const getSlugFromWikilink = (wikilink: string): Slug =>
  wikilink.split(SEPARATOR);
