/**
 * 1. Remove frontmatter part from markdown (the galaxy blog supports custom frontmatter)
 * 2. Set correct title (can be from frontmatter, heading "#" and filename)
 *
 * @param title the title of the post
 * @returns
 */
function remarkGalaxy({ title }) {
  return function (tree) {
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
  };
}

export default remarkGalaxy;
