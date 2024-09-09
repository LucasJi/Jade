import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { fromMarkdown } from './fromMarkdown';
import { syntax } from './syntax';

const remarkWikilink: Plugin<[], Root> = function (
  opts = { markdownFolder: 'page' },
) {
  const data = this.data();

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);

  micromarkExtensions.push(syntax());
  fromMarkdownExtensions.push(fromMarkdown());
};

export {
  fromMarkdown as fromWikilinkMarkdown,
  remarkWikilink,
  syntax as wikilinkSyntax,
};
