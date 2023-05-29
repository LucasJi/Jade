import syntax from './syntax';
import fromMarkdown from './fromMarkdown';
import toMarkdown from './toMarkdown';

function wikilinkPlugin(opts = {}) {
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
    wikilinkClassName: 'wiki-link',
  };

  add('micromarkExtensions', syntax(opts));
  add('fromMarkdownExtensions', fromMarkdown(opts));
  add('toMarkdownExtensions', toMarkdown(opts));
}

export default wikilinkPlugin;
export { wikilinkPlugin };
