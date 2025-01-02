import { Root, Text } from 'mdast';
import type { Plugin } from 'unified';
import { Node, visit } from 'unist-util-visit';

const regex = /#([A-Za-z0-9_\-/]*[A-Za-z_\-/]+[A-Za-z0-9_\-/]*)(?=\s|$|\.)/g;
export const remarkTag: Plugin<[], Root> = () => {
  return (tree, _) => {
    visit(tree as Node, 'text', (node: Text, index: number | null, parent) => {
      if (parent?.type === 'code' || parent?.type === 'inlineCode') {
        return;
      }

      const value = node.value;
      const matches = Array.from(value.matchAll(regex));

      if (matches.length === 0) {
        return;
      }

      const children = [];
      let lastIndex = 0;

      for (const match of matches) {
        const startIndex = match.index!;

        // 添加标签前的文本
        if (startIndex > lastIndex) {
          children.push({
            type: 'text',
            value: value.slice(lastIndex, startIndex),
          });
        }

        // 添加标签节点
        children.push({
          type: 'tag',
          value: match[1],
          data: {
            hName: 'section',
            hProperties: {
              'data-tag': match[1],
            },
          },
        });

        lastIndex = startIndex + match[0].length;
      }

      // 添加最后一个标签后的文本
      if (lastIndex < value.length) {
        children.push({
          type: 'text',
          value: value.slice(lastIndex),
        });
      }

      parent?.children.splice(index!, 1, ...children);
    });
  };
};
