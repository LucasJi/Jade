import type {
  Extension as FromMarkdownExtension,
  Handle,
} from 'mdast-util-from-markdown';

import { ok as assert } from 'devlop';

const gfmTaskListItemFromMarkdown = (): FromMarkdownExtension => {
  return {
    exit: {
      taskListCheckValueChecked: exitCheck,
      taskListCheckValueUnchecked: exitCheck,
      paragraph: exitParagraphWithTaskListItem,
    },
  };
};

const exitCheck: Handle = function (token) {
  // We’re always in a paragraph, in a list item.
  const node = this.stack[this.stack.length - 2];
  assert(node.type === 'listItem');
  node.checked = token.type === 'taskListCheckValueChecked';
};

const exitParagraphWithTaskListItem: Handle = function (token) {
  const parent = this.stack[this.stack.length - 2];

  if (
    parent &&
    parent.type === 'listItem' &&
    typeof parent.checked === 'boolean'
  ) {
    const node = this.stack[this.stack.length - 1];
    assert(node.type === 'paragraph');
    const head = node.children[0];

    if (head && head.type === 'text') {
      const siblings = parent.children;
      let index = -1;
      let firstParagraph;

      while (++index < siblings.length) {
        const sibling = siblings[index];
        if (sibling.type === 'paragraph') {
          firstParagraph = sibling;
          break;
        }
      }

      if (firstParagraph === node) {
        // Must start with a space or a tab.
        head.value = head.value.slice(1);

        if (head.value.length === 0) {
          node.children.shift();
        } else if (
          node.position &&
          head.position &&
          typeof head.position.start.offset === 'number'
        ) {
          head.position.start.column++;
          head.position.start.offset++;
          node.position.start = Object.assign({}, head.position.start);
        }
      }
    }
  }

  this.exit(token);
};

export default gfmTaskListItemFromMarkdown;
