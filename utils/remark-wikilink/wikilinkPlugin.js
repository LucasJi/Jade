import syntax from './syntax';
import fromMarkdown from './fromMarkdown';
import toMarkdown from './toMarkdown';

let warningIssued;

function wikiLinkPlugin(opts = {}) {
  const data = this.data();

  function add(field, value) {
    if (data[field]) {
      data[field].push(value);
    } else {
      data[field] = [value];
    }
  }

  if (
    !warningIssued &&
    ((this.Parser &&
      this.Parser.prototype &&
      this.Parser.prototype.blockTokenizers) ||
      (this.Compiler &&
        this.Compiler.prototype &&
        this.Compiler.prototype.visitors))
  ) {
    warningIssued = true;
    console.warn(
      '[remark-wiki-link] Warning: please upgrade to remark 13 to use this plugin',
    );
  }

  add('micromarkExtensions', syntax(opts));
  add('fromMarkdownExtensions', fromMarkdown(opts));
  add('toMarkdownExtensions', toMarkdown(opts));
}

export default wikiLinkPlugin;
