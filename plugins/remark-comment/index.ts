import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { addExtensions } from '../utils';
import { fromMarkdown } from './fromMarkdown';
import { html } from './micromark/html';
import { syntax } from './micromark/syntax';
import { toMarkdown } from './toMarkdown';

const remarkComment: Plugin<[], Root> = function () {
  addExtensions({
    data: this.data(),
    micromarkExtension: syntax(),
    fromMarkdownExtension: fromMarkdown(),
    toMarkdownExtension: toMarkdown(),
  });
};

export { html as commentHtml, syntax as commentSyntax, remarkComment };
