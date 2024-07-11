import { toString } from 'mdast-util-to-string';

function separateHeadings(tree, headingText) {
  const length = tree.children.length;
  const headingIdx = tree.children.findIndex(
    child => child.type === 'heading' && toString(child) === headingText,
  );

  if (headingIdx === -1) {
    return tree.children;
  }

  const heading = tree.children[headingIdx];
  const depth = heading.depth;

  let nextSameDepthHeadingIdx = tree.children.findIndex(
    (child, index) =>
      index > headingIdx && child.type === 'heading' && child.depth === depth,
  );

  if (nextSameDepthHeadingIdx === -1) {
    nextSameDepthHeadingIdx = length;
  }

  return tree.children.slice(headingIdx, nextSameDepthHeadingIdx);
}

/**
 * 1. Remove frontmatter part from markdown (the galaxy blog supports custom frontmatter)
 * 2. Set correct title (can be from frontmatter, heading "#" and filename)
 *
 * @param title the title of the post
 * @param headings only the headings' content will be displayed
 * @returns
 */
function remarkJade({ title, wikilink }) {
  return function (tree) {
    const splits = wikilink ? wikilink.split('#') : [];
    const headings = splits.length > 1 ? splits.slice(1) : null;
    if (headings) {
      const deepestHeading = headings[headings.length - 1];
      tree.children = separateHeadings(tree, deepestHeading);
    } else {
      // 1. Remove frontmatter
      tree.children = tree.children.filter(child => child.type !== 'yaml');

      // 2. Set title
      const titleHeadingIdx = tree.children.findIndex(
        node => node.type === 'heading' && node.depth === 1,
      );
      if (titleHeadingIdx !== -1) {
        const titleHeadingNode = tree.children[titleHeadingIdx];
        const textNode = titleHeadingNode.children.find(
          child => child.type === 'text',
        );
        tree.children[titleHeadingIdx] = {
          ...titleHeadingNode,
          children: [
            {
              ...textNode,
              value: title,
            },
          ],
        };
      } else {
        const textNode = { type: 'text', value: title };
        const titleHeadingNode = {
          type: 'heading',
          depth: 1,
          children: [textNode],
        };
        tree.children.unshift(titleHeadingNode);
      }
    }
  };
}

export default remarkJade;
