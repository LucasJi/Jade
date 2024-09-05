import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import fromMarkdown from './fromMarkdown';
import syntax from './syntax';

const remarkTaskList: Plugin<[], Root> = function () {
  const data = this.data();

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);

  micromarkExtensions.push(syntax());
  fromMarkdownExtensions.push(fromMarkdown());
};

export default remarkTaskList;
