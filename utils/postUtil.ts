import { fromMarkdownWikilink, syntax } from '@utils/remark-wikilink';
import fs from 'fs';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { join } from 'path';
import { Post, PostGraph, PostGraphLink, Slug } from 'types';
import { visit } from 'unist-util-visit';
import { redis } from './redisUtil';

const SEPARATOR = '/';
const TITLE_REG = /^#\s+.+/;
const SLUGS_KEY = 'slugs';
const POSTS_KEY = 'posts';
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

export const getPostBySlug = (slug: string[]) => {
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
    forwardLinks: [],
    backlinks: [],
    href: `posts/${wikilink}`,
  };

  return post;
};

export const getCachedPosts = async (): Promise<Post[]> => {
  const postsJson = await redis.get(POSTS_KEY);

  if (postsJson) {
    return JSON.parse(postsJson);
  }

  const posts: Array<Post> = [];
  const slugs = await getCachedSlugs();
  const relativeFolderSet = new Set<string>();
  for (const slug of slugs) {
    relativeFolderSet.add(getRelativeParentFolderFromSlug(slug));
  }
  const relativeFolders = [...relativeFolderSet.values()];

  for (const slug of slugs) {
    const post = await getCachedPostBySlug(slug);
    post.slugIdx = relativeFolders.findIndex(
      rf => rf === getRelativeParentFolderFromSlug(slug),
    );
    posts.push(post);
  }

  resolveWikilinks(posts);

  await redis.set(POSTS_KEY, JSON.stringify(posts));

  return posts;
};

export const getCachedPostGraph = async (): Promise<PostGraph> => {
  const posts = await getCachedPosts();
  const postGraphLinks: PostGraphLink[] = [];

  for (const post of posts) {
    const { forwardLinks, backlinks, wikilink } = post;
    for (const fl of forwardLinks) {
      postGraphLinks.push({
        source: wikilink,
        target: fl,
      });
    }

    for (const bl of backlinks) {
      postGraphLinks.push({
        source: bl,
        target: wikilink,
      });
    }
  }

  return { nodes: posts, links: postGraphLinks };
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

export const convertWikilinkToSlug = (wikilink: string): Slug => {
  let postRelativePath = wikilink;
  if (wikilink.startsWith(SEPARATOR)) {
    postRelativePath = wikilink.replace(SEPARATOR, '');
  }
  return postRelativePath.split(SEPARATOR);
};

const getRelativeParentFolderFromSlug = (slug: Slug): string =>
  slug.slice(0, slug.length - 1).join(SEPARATOR);
