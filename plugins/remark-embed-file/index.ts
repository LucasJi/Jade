import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { fromMarkdown } from './fromMarkdown';
import { syntax } from './syntax';

const remarkEmbedFile: Plugin<[], Root> = function () {
  const data = this.data();

  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);

  fromMarkdownExtensions.push(fromMarkdown());
  micromarkExtensions.push(syntax());
};

export {
  fromMarkdown as fromEmbedFileMarkdown,
  remarkEmbedFile,
  syntax as remarkEmbedFileSyntax,
};
