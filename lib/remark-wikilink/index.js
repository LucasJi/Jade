import fromMarkdown from './fromMarkdown';
import syntax from './syntax';

function remarkWikilink(opts = { markdownFolder: 'page' }) {
  const data = this.data();

  function add(field, value) {
    if (data[field]) {
      data[field].push(value);
    } else {
      data[field] = [value];
    }
  }

  opts = {
    ...opts,
  };

  add('micromarkExtensions', syntax(opts));
  add('fromMarkdownExtensions', fromMarkdown(opts));
}

export { fromMarkdown as fromMarkdownWikilink, remarkWikilink, syntax };
