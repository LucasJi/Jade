import { Transformer } from '@/processor/types';
import unifiedProcessor from '@/processor/unified';
import { Heading, ListItem, Root, RootContent } from 'mdast';
import { toString } from 'mdast-util-to-string';
import { toc } from 'mdast-util-toc';
import { VFile } from 'vfile';

/**
 * Transform note to mdast
 */
export const transformVFileToMdast = (vFile: VFile): Root => {
  return unifiedProcessor.parse(vFile);
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

export const transformMdastToHeadings = (mdast: Root): ListItem[] => {
  const result = toc(mdast, { minDepth: 2 });
  const map = result.map;
  return map ? map.children : [];
};

export const transformSubHeadings = (mdast: Root, headings: string[]) => {
  if (headings.length <= 0) {
    return;
  }

  for (const heading of headings) {
    const begin = mdast.children.findIndex(
      child => child.type === 'heading' && toString(child) === heading,
    );

    if (begin == -1) {
      return;
    }

    const startNode = mdast.children[begin] as Heading;
    const end = mdast.children.findIndex(
      (child, index) =>
        child.type === 'heading' &&
        child.depth === startNode.depth &&
        index > begin,
    );

    mdast.children = mdast.children.slice(
      begin,
      end === -1 ? mdast.children.length : end,
    );
  }
};
