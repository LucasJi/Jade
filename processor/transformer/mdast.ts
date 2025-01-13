import { Wikilink } from '@/plugins/types';
import { Transformer } from '@/processor/types';
import unifiedProcessor from '@/processor/unified';
import { endsWith, trimEnd } from 'lodash';
import { Heading, ListItem, Parent, Root, RootContent } from 'mdast';
import { toString } from 'mdast-util-to-string';
import { toc } from 'mdast-util-toc';
import { Node, visit } from 'unist-util-visit';
import { VFile } from 'vfile';

/**
 * The title of note has three sources:
 * 1. The 'title' prop in the frontmatter
 * 2. The '#' heading
 * 3. The filename of note
 *
 * The priority: 1 > 2 > 3
 */
export const determineFinalTitle = (
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

export const generateHeadingsFromMdast = (mdast: Root): ListItem[] => {
  const result = toc(mdast, { minDepth: 2 });
  const map = result.map;
  return map ? map.children : [];
};

export const truncateMdast = (mdast: Root, headings: string[]) => {
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

export const convertFrontmatterToSection = (mdast: Root, frontmatter: any) => {
  const idx = mdast.children.findIndex(child => child.type === 'yaml');

  if (idx === -1 || idx > 0) {
    return;
  }

  const frontmatterChild = mdast.children[idx] as Parent;
  frontmatterChild.type = 'paragraph';
  frontmatterChild.data = {
    hName: 'section',
    hProperties: {
      dataFrontmatter: true,
    },
  };
  frontmatterChild.children = [
    {
      type: 'text',
      value: JSON.stringify(frontmatter),
    },
  ];
};

export const collectInternalLinkTargets = (mdast: Root): string[] => {
  const targets: string[] = [];
  visit(mdast as Node, 'wikilink', (node: Wikilink) => {
    if (node.value) {
      if (endsWith(node.value, '\\')) {
        targets.push(trimEnd(node.value, '\\'));
      } else {
        targets.push(node.value);
      }
    }
  });
  return targets;
};

const mdastTransformer = (
  vFile: VFile,
  frontmatter: Record<any, any>,
  plainNoteName: string,
) => {
  const mdast = unifiedProcessor.parse(vFile);
  determineFinalTitle(mdast, frontmatter, plainNoteName);
  const headings = generateHeadingsFromMdast(mdast);
  convertFrontmatterToSection(mdast, frontmatter);
  const targets = collectInternalLinkTargets(mdast);

  return {
    mdast,
    headings,
    targets,
  };
};

export default mdastTransformer;
