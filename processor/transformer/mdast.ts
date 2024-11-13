import { Transformer } from '@/processor/types';
import { Heading, Root } from 'mdast';

import { remarkCallout } from '@/plugins/remark-callout';
import remarkHighlight from '@/plugins/remark-highlight';
import { remarkTaskList } from '@/plugins/remark-task-list';
import { remarkWikilink } from '@/plugins/remark-wikilink';
import remarkBreaks from 'remark-breaks';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { PluggableList, unified } from 'unified';
import { VFile } from 'vfile';
import { matter } from 'vfile-matter';

const remarkPlugins: PluggableList = [
  remarkFrontmatter,
  remarkGfm,
  remarkBreaks,
  remarkHighlight,
  remarkTaskList,
  remarkCallout,
  remarkMath,
  remarkWikilink,
];

const createUnifiedProcessor = () => {
  return unified().use(remarkParse).use(remarkPlugins);
};

const parseFrontMatter = (vFile: VFile) => {
  matter(vFile);
  const { matter: frontmatter } = vFile.data as any;
  return frontmatter ?? {};
};

/**
 * Transform note to mdast
 */
export const transformVFileToMdast = (vFile: VFile): Root => {
  const processor = createUnifiedProcessor();
  return processor.parse(vFile);
};

export const transformTitle = (
  mdast: Root,
  frontMatter: Transformer.FrontMatter,
  noteFilename: string,
) => {
  const { title } = frontMatter;

  if (title) {
    const titleHeading = mdast.children.find(
      node => node.type === 'heading' && node.depth === 1,
    ) as Heading;

    if (titleHeading) {
      titleHeading.children = [
        {
          type: 'text',
          value: title,
        },
      ];
    } else {
      mdast.children = [
        {
          type: 'text',
          value: title,
        },
        ...mdast.children,
      ];
    }
  }
};
