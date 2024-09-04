import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { fromMarkdown } from './fromMarkdown';
import { syntax } from './syntax';
import { toMarkdown } from './toMarkdown';

const remarkHighlight: Plugin<[], Root> = function () {
  const data = this.data() as any;

  function add(key: string, value: unknown) {
    if (Array.isArray(data[key])) {
      (data[key] as unknown[]).push(value);
    } else {
      data[key] = [value];
    }
  }

  add('micromarkExtensions', syntax());
  add('fromMarkdownExtensions', fromMarkdown());
  add('toMarkdownExtensions', toMarkdown());
};

export default remarkHighlight;
