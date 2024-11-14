import { Transformer } from '@/processor/types';
import { Heading, ListItem, Root, RootContent } from 'mdast';

import { remarkCallout } from '@/plugins/remark-callout';
import remarkHighlight from '@/plugins/remark-highlight';
import { remarkTaskList } from '@/plugins/remark-task-list';
import { remarkWikilink } from '@/plugins/remark-wikilink';
import { toc } from 'mdast-util-toc';
import remarkBreaks from 'remark-breaks';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { PluggableList, unified } from 'unified';
import { VFile } from 'vfile';

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

/**
 * Transform note to mdast
 */
export const transformVFileToMdast = (vFile: VFile): Root => {
  const processor = createUnifiedProcessor();
  return processor.parse(vFile);
};

/**
 * The title of note has three sources:
 * 1. The 'title' prop in the frontmatter
 * 2. The '#' heading
 * 3. The filename of note
 *
 * The priority: 1 > 2 > 3
 */
export const transformTitle = (
  mdast: Root,
  frontMatter: Transformer.FrontMatter,
  noteFilename: string,
) => {
  const { title } = frontMatter;
  const titleHeading = mdast.children.find(
    node => node.type === 'heading' && node.depth === 1,
  ) as Heading;

  if (title) {
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
  } else if (!titleHeading) {
    const [firstChild, ...restChildren] = mdast.children;
    const titleNode: RootContent = {
      type: 'heading',
      depth: 1,
      children: [
        {
          type: 'text',
          value: noteFilename,
        },
      ],
    };

    if (firstChild && firstChild.type === 'yaml') {
      mdast.children = [firstChild, titleNode, ...restChildren];
    } else {
      mdast.children = [titleNode, ...mdast.children];
    }
  }
};

export const transformMdastToHeadings = (mdastTree: Root): ListItem[] => {
  const result = toc(mdastTree);
  const map = result.map;
  return map ? map.children : [];
};
