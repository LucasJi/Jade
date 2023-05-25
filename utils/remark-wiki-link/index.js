import { toMarkdown } from 'mdast-util-wiki-link';
import { html, syntax } from './lib/syntax';
import {
  fromMarkdown,
  wikiLinkTransclusionFormat,
} from './lib/fromMarkdown.js';

let warningIssued;

function wikiLinkPlugin(opts = { markdownFolder: '' }) {
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

  opts = {
    ...opts,
    aliasDivider: opts.aliasDivider ? opts.aliasDivider : '|',
    pageResolver: opts.pageResolver
      ? opts.pageResolver
      : wikilink => {
          console.log('pageResolve wikilink', wikilink);
          const image = wikiLinkTransclusionFormat(wikilink)[1];
          let heading = '';
          if (!image && !wikilink.startsWith('#') && wikilink.match(/#/)) {
            [, heading] = wikilink.split('#');
            wikilink = wikilink.replace(`#${heading}`, '');
          }
          if (opts.permalinks || opts.markdownFolder) {
            const url = opts.permalinks.find(
              p =>
                p === wikilink ||
                (p.split('/').pop() === wikilink &&
                  !opts.permalinks.includes(p.split('/').pop())),
            );
            if (url) {
              if (heading) {
                return [`${url}#${heading}`.replace(/ /g, '-').toLowerCase()];
              }
              return image ? [url] : [url.replace(/ /g, '-').toLowerCase()];
            }
          }
          return image
            ? [wikilink]
            : [wikilink.replace(/ /g, '-').toLowerCase()];
        },
    // TODO: hwo to deal with the permalinks can reference: https://yoast.com/what-is-a-permalink/
    permalinks: opts.permalinks,
    wikiLinkClassName: 'wiki-link',
  };

  console.log('opts', opts);
  add('fromMarkdownExtensions', fromMarkdown(opts));
  add('htmlExtensions', html(opts));
  add('micromarkExtensions', syntax(opts));
  add('toMarkdownExtensions', toMarkdown(opts));
  console.log('data:', data);
}

export default wikiLinkPlugin;
export { wikiLinkPlugin };
