import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { fromMarkdown } from './fromMarkdown';
import { syntax } from './syntax';
import { toMarkdown } from './toMarkdown';

const remarkHighlight: Plugin<[], Root> = function () {
  const data = this.data();

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions =
    data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push(syntax());
  fromMarkdownExtensions.push(fromMarkdown());
  toMarkdownExtensions.push(toMarkdown());
};

export default remarkHighlight;
