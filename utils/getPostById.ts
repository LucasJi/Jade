import { Post } from '@/types';
import { Heading, Text } from 'mdast';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import { matter } from 'vfile-matter';
import { createFetch } from './common';
import { SEPARATOR } from './constants';

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
): { title: string; frontmatter: undefined | { [key: string]: any } } => {
  let title: string = '';

  // try to get title from frontmatter
  const postVFile = DEFAULT_MD_PROCESSOR.processSync(post);
  const frontmatter = postVFile.data.matter as
    | undefined
    | { [key: string]: any };
  title = frontmatter?.title;

  // try to get title from heading `#`
  if (!title) {
    const root = DEFAULT_MD_PROCESSOR.parse(post);
    const titleHeadingIdx = root.children.findIndex(
      node => node.type === 'heading' && node.depth === 1,
    );
    if (titleHeadingIdx !== -1) {
      const titleHeadingNode = root.children[titleHeadingIdx] as Heading;
      const textNode = titleHeadingNode.children.find(
        child => child.type === 'text',
      ) as Text;
      title = textNode.value;
    }
  }

  // use file name as title
  if (!title) {
    title = filename;
  }

  return { title, frontmatter };
};

export const getPostById = async (id: string): Promise<Post | null> => {
  const path = atob(id);
  const file: any = await createFetch(`/contents/${path}`).then(resp =>
    resp.json(),
  );
  try {
    // resolve emoji base64 decoding problem
    const content = Buffer.from(file.content, 'base64').toString();
    const filenameSplits = path.split(SEPARATOR);
    const filename = filenameSplits[filenameSplits.length - 1];
    const { title, frontmatter } = resolvePost(content, filename);
    const post: Post = {
      id,
      content: content,
      title,
      frontmatter,
      forwardLinks: [],
      backlinks: [],
      ctime: new Date(),
    };
    return post;
  } catch (e) {
    console.error('get post by id error', id, e);
    return null;
  }
};
