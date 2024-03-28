import { toc } from 'mdast-util-toc';

function tocExtractor() {
  return function (tree) {
    const result = toc(tree);
    // Ignore title heading(#)
    const listItem = result.map.children[0];

    tree.children = [];

    if (listItem.children.length > 1) {
      tree.children = [result.map.children[0].children[1]];
    }

    console.log(JSON.stringify(tree.children));
  };
}

export { tocExtractor };
