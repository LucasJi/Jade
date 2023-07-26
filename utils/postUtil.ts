import fs from 'fs';
import { join } from 'path';
import { Post, PostMap, Slug } from 'types';
import { redis } from './redisUtil';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { fromMarkdownWikilink, syntax } from '@utils/remark-wikilink';
import { visit } from 'unist-util-visit';

const SEPARATOR = '/';
const TITLE_REG = /^#\s+.+/;
const SLUGS_KEY = 'slugs';
export const POST_DIR = join(process.cwd(), '_posts', SEPARATOR);

export const getCachedSlugs = async (): Promise<Slug[]> => {
  const slugsJson = await redis.get(SLUGS_KEY);

  let slugs: Array<Slug>;
  if (slugsJson === null) {
    slugs = getPostSlugs();
    await redis.set(SLUGS_KEY, JSON.stringify(slugs));
  } else {
    slugs = JSON.parse(slugsJson);
  }

  return slugs;
};

const clearCachedSlugs = () => {
  redis.del(SLUGS_KEY);
};

const getPostSlugs = () => {
  const fileFullPaths = walkFilesRecursively(POST_DIR);
  return fileFullPaths.map(fullPath => getSlugFromFullPath(fullPath));
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
  return join(POST_DIR, ...slugClone);
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
    await redis.set(wikilink, JSON.stringify(post));
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
    backlinks: [],
    href: `posts/${wikilink}`,
  };

  return post;
};

export const getCachedPosts = async (): Promise<Post[]> => {
  const posts: Array<Post> = [];
  const slugs = await getCachedSlugs();
  for (const slug of slugs) {
    const post = await getCachedPostBySlug(slug);
    if (post !== null) {
      posts.push(post);
    }
  }
  return posts;
};

export const getCachedPostMap = async (): Promise<PostMap> => {
  const posts = await getCachedPosts();
  const postMap: PostMap = {};
  posts.forEach(post => {
    postMap[post.wikilink] = post;
  });
  return postMap;
};

export const initPosts = async (): Promise<Post[]> => {
  clearCachedSlugs();

  const posts = getPosts();
  resolveWikilinks(posts);

  for (const post of posts) {
    await updateCachedPost(post);
  }
  return posts;
};

const getPosts = () => {
  const posts: Array<Post> = [];
  const slugs = getPostSlugs();
  for (const slug of slugs) {
    const post = getPostBySlug(slug);
    if (post !== null) {
      posts.push(post);
    }
  }
  return posts;
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

      const forwardWikilinks: Set<string> = new Set();

      visit(tree, 'wikilink', node => {
        const { value } = node;
        forwardWikilinks.add(value);
      });

      post.forwardWikilinks = Array.from(forwardWikilinks);

      for (const fl of forwardWikilinks) {
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

const updateCachedPost = async (post: Post) => {
  await redis.set(post.wikilink, JSON.stringify(post));
};

const getSlugFromWikilink = (wikilink: string): Slug =>
  wikilink.split(SEPARATOR);
