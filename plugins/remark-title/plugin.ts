import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { Node, visit } from 'unist-util-visit';

export const remarkTitle: Plugin<[{ filename: string }?], Root> = options => {
  const filename = options?.filename || '';
  return (tree, _) => {
    visit(tree as Node, (node, index) => {
      // console.log(node, index);
    });
  };
};
