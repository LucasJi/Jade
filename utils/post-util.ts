import fs from 'fs';
import { Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toc } from 'mdast-util-toc';
import { join, posix, sep } from 'path';
import { revalidateTag } from 'next/cache';
import { PathItem, Post, PostGraph, TreeNode } from '@types';
import { fromMarkdownWikilink, syntax } from '@/plugins/remark-wikilink';
import { visit } from 'unist-util-visit';
import remarkFrontmatter from 'remark-frontmatter';
import { remark } from 'remark';
import { matter } from 'vfile-matter';

// env variables
const includeDirs: string[] = process.env.INCLUDE_DIRS?.split(',') || [];
const branch = process.env.GITHUB_BRANCH;
const localPostRootDir = process.env.LOCAL_POST_ROOT_DIR || '';
const ignoreDirs = ['.git'];

const SEP = localPostRootDir ? sep : posix.sep;

// find Markdown mark "#"
const MD_TITLE_REG = /^#\s+.+/;

// find Markdown file "xxx.md"
const MD_SUFFIX_REG = /\.md$/;

// find Markdown heading marks: "#", "##", "###", "####", "#####", "######"
const MD_HEADING_REG = /^(#{1,6})\s+.+/;

const POST_DIR = join(process.cwd(), '_posts', SEP);

export const githubRequest = (url: string, tag: string = '') =>
  fetch(
    `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}${url}`,
    {
      // cache: 'no-cache',
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

export const getGitTree = async (): Promise<PathItem[]> => {
  return githubRequest(`/git/trees/${branch}?recursive=1`).then(data => {
    const { tree }: { tree: any[] } = data;
    return tree.filter(value =>
      includeDirs.length <= 0
        ? value.type === 'blob' && value.path.endsWith('.md')
        : value.type === 'blob' &&
          value.path.endsWith('.md') &&
          includeDirs.find(predicate => value.path.includes(predicate)),
    );
  });
};

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
const resolveLocalPosts = (
  dir: string = localPostRootDir,
  absolutePaths: PathItem[] = [],
) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const path = join(dir, file);
    if (fs.statSync(path).isDirectory()) {
      if (ignoreDirs.includes(file)) {
        continue;
      }

      // const relativePath = path.replace(localPostRootDir + SEP, '');
      // absolutePaths.push({
      //   path: relativePath,
      //   type: 'tree',
      // });

      resolveLocalPosts(path, absolutePaths);
    } else if (file.endsWith('.md')) {
      const relativePath = path.replace(localPostRootDir + SEP, '');
      absolutePaths.push({
        path: relativePath,
        type: 'blob',
      });
    }
  }

  return absolutePaths;
};

const buildPostTree = (paths: PathItem[]): TreeNode[] => {
  const tree: TreeNode = {
    name: 'root',
    children: [],
    isDir: true,
  };

  paths.forEach(item => {
    const pathParts = item.path.split(SEP);
    const dirs: string[] = pathParts.slice(0, -1);
    let currentNode = tree;

    // find or create nodes for directories
    dirs.forEach(dir => {
      let dirNode = currentNode.children.find(
        node => node.name === dir && node.isDir,
      );

      if (!dirNode) {
        dirNode = {
          name: dir,
          children: [],
          isDir: true,
        };

        currentNode.children.push(dirNode);
      }

      currentNode.children.sort((a, b) => {
        if (a.isDir && !b.isDir) {
          return -1;
        } else if (!a.isDir && b.isDir) {
          return 1;
        }
        return a.name.localeCompare(b.name);
      });

      currentNode = dirNode;
    });

    if (item.type === 'tree') {
      const childDir = pathParts[pathParts.length - 1];
      currentNode.children.push({
        name: childDir,
        children: [],
        isDir: true,
      });
    }

    if (item.type === 'blob') {
      const file: string = pathParts[pathParts.length - 1];
      currentNode.children.push({
        path: base64Encode(item.path),
        name: file.replace(MD_SUFFIX_REG, ''),
        children: [],
        isDir: false,
      });
    }
  });

  return tree.children;
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

export const getPostTree = async (): Promise<TreeNode[]> => {
  if (localPostRootDir) {
    const paths = resolveLocalPosts();
    return Promise.resolve(buildPostTree(paths));
  }
  return getGitTree().then(paths => {
    return buildPostTree(paths);
  });
};

const resolveWikilinks = (posts: Post[]) => {
  const findPostById = (id: string): Post | undefined => {
    return posts.find(p => p.id === id);
  };

  for (const post of posts) {
    if (post !== null) {
      const tree = fromMarkdown(post.content, {
        extensions: [syntax()],
        mdastExtensions: [fromMarkdownWikilink()],
      });

      const forwardLinks: Set<string> = new Set();

      visit(tree, 'wikilink', node => {
        const { value }: { value: string } = node;
        const post = posts.find(post => {
          const path = base64Decode(post.id);
          return path.includes(value.split('#')[0]);
        });
        if (post) {
          forwardLinks.add(post.id);
        }
      });

      post.forwardLinks = Array.from(forwardLinks);

      for (const fl of forwardLinks) {
        const fp = findPostById(fl);
        if (fp) {
          const bls = new Set(fp.backlinks);
          bls.add(post.id);
          fp.backlinks = Array.from(bls);
        }
      }
    }
  }
};

const cachedPosts: Post[] = [];

export const getPosts = async (): Promise<Post[]> => {
  if (cachedPosts.length > 0) {
    console.log('cached posts:', cachedPosts.length);
    return Promise.resolve(cachedPosts);
  }

  const posts: Array<Post> = [];
  const ids = await getPostIds();

  for (const id of ids) {
    const post = await getPostById(id);

    if (!post) {
      continue;
    }

    posts.push(post);
  }

  resolveWikilinks(posts);

  if (cachedPosts.length === 0) {
    cachedPosts.push(...posts);
  }

  return posts;
};

export const getPostIds = async (): Promise<string[]> => {
  if (localPostRootDir) {
    const paths = resolveLocalPosts();
    return Promise.resolve(paths.map(p => base64Encode(p.path)));
  }
  return getGitTree().then(tree => {
    return tree.map(value => base64Encode(value.path));
  });
};

let cachedPostGraph: PostGraph | null = null;

export const getPostGraph = async () => {
  if (cachedPostGraph) {
    return Promise.resolve(cachedPostGraph);
  }

  return getPosts().then(posts =>
    getPostGraphFromPosts(posts).then(postGraph => {
      cachedPostGraph = postGraph;
      return postGraph;
    }),
  );
};

export const getPostGraphFromPosts = async (
  posts: Post[],
): Promise<PostGraph> => {
  const postGraphLinks: Set<string> = new Set();
  const ids = posts.map(p => p.id);

  for (const post of posts) {
    const { forwardLinks, backlinks, id } = post;
    for (const fl of forwardLinks) {
      if (ids.includes(fl)) {
        postGraphLinks.add(
          JSON.stringify({
            source: id,
            target: fl,
          }),
        );
      }
    }

    for (const bl of backlinks) {
      if (ids.includes(bl)) {
        postGraphLinks.add(
          JSON.stringify({
            source: bl,
            target: id,
          }),
        );
      }
    }
  }

  return {
    nodes: posts.map(post => ({
      ...post,
      content: '',
      frontmatter: undefined,
    })),
    links: Array.from(postGraphLinks).map(str => JSON.parse(str)),
  };
};

// convert frontmatter to metadata, see: https://github.com/remarkjs/remark-frontmatter?tab=readme-ov-file#example-frontmatter-as-metadata
function frontYamlMatterHandler() {
  return function (tree: any, file: any) {
    matter(file);
  };
}

const DEFAULT_MD_PROCESSOR = remark()
  .use(remarkFrontmatter, ['yaml'])
  .use(frontYamlMatterHandler);

export const resolvePost = (
  post: string,
  filename: string,
): { title: string; frontmatter: { [key: string]: any } | undefined } => {
  let title: string = '';

  // try to get title from frontmatter
  const frontmatter: { [key: string]: any } | undefined = {};
  try {
    // const postVFile = DEFAULT_MD_PROCESSOR.processSync(post);
    // frontmatter = postVFile.data.matter as undefined | { [key: string]: any };
    // title = frontmatter?.title;
  } catch (e) {
    // do nothing
  }

  // try to get title from heading `#`
  // if (!title) {
  //   const root = DEFAULT_MD_PROCESSOR.parse(post);
  //   const titleHeadingIdx = root.children.findIndex(
  //     node => node.type === 'heading' && node.depth === 1,
  //   );
  //   if (titleHeadingIdx !== -1) {
  //     const titleHeadingNode = root.children[titleHeadingIdx] as Heading;
  //     const textNode = titleHeadingNode.children.find(
  //       child => child.type === 'text',
  //     ) as Text;
  //     title = textNode.value;
  //   }
  // }

  // use file name as title
  if (!title) {
    title = filename.replace(MD_SUFFIX_REG, '');
  }

  return { title, frontmatter };
};

const postMap = new Map<string, Post>();

export const getPostById = async (id: string): Promise<Post | null> => {
  if (postMap.has(id)) {
    return postMap.get(id)!;
  }

  try {
    const path = base64Decode(id);
    let file;
    if (localPostRootDir) {
      file = fs.readFileSync(join(localPostRootDir, path), 'utf8');
    } else {
      file = await githubRequest(`/contents/${path}`, `post:${id}`);
    }
    // resolve emoji base64 decoding problem
    const content = localPostRootDir ? file : base64Decode(file.content);
    const filenameSplits = path.split(SEP);
    const filename = filenameSplits[filenameSplits.length - 1];
    const { title, frontmatter } = resolvePost(content, filename);
    const post = {
      id,
      content: content,
      title,
      frontmatter,
      forwardLinks: [],
      backlinks: [],
      ctime: new Date(),
    };

    postMap.set(id, post);

    return post;
  } catch (e) {
    console.error('get post by id error', id, e);
    return null;
  }
};

export const getAdjacencyPostsById = async (id: string): Promise<Post[]> => {
  const posts = await getPosts();
  return posts.filter(
    p => p.id === id || p.backlinks.includes(id) || p.forwardLinks.includes(id),
  );
};
