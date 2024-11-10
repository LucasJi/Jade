import { Element, Nodes } from 'hast';
import { Components as JsxRuntimeComponents } from 'hast-util-to-jsx-runtime';
import { urlAttributes } from 'html-url-attributes';
import { Root } from 'mdast';
import { toc } from 'mdast-util-toc';
import remarkParse from 'remark-parse';
import remarkRehype, { Options as RemarkRehypeOptions } from 'remark-rehype';
import { PluggableList, unified } from 'unified';
import { Visitor, VisitorResult, visit } from 'unist-util-visit';
import { VFile } from 'vfile';

export type Components = Partial<JsxRuntimeComponents>;

type UrlTransformer = (
  url: string,
  key: string,
  node: Readonly<Element>,
) => string | null | undefined;

type TextTransformer = (note: string) => string;

type Options = {
  /**
   * Markdown.
   */
  note?: string | null | undefined;
  /**
   * Wrap in a `div` with this class name.
   */
  className?: string | null | undefined;
  /**
   * List of rehype plugins to use.
   */
  rehypePlugins?: import('unified').PluggableList | null | undefined;
  /**
   * List of remark plugins to use.
   */
  remarkPlugins?: import('unified').PluggableList | null | undefined;
  /**
   * Options to pass through to `remark-rehype`.
   */
  remarkRehypeOptions?: Readonly<RemarkRehypeOptions> | null | undefined;
  /**
   * Ignore HTML in markdown completely (default: `false`).
   */
  skipHtml?: boolean | null | undefined;
  /**
   * Change URLs (default: `defaultUrlTransformer`)
   */
  urlTransformer?: UrlTransformer | null | undefined;
};

const emptyPlugins: PluggableList = [];
const emptyRemarkRehypeOptions: Readonly<RemarkRehypeOptions> = {
  allowDangerousHtml: true,
};
const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i;

/**
 * Parse note to hast tree
 * @param options
 */
export const hastTransformer = (
  options: Options,
): { mdastTree: Root; hastTree: Nodes } => {
  const note = options.note || '';
  const className = options.className;
  const rehypePlugins = options.rehypePlugins || emptyPlugins;
  const remarkPlugins = options.remarkPlugins || emptyPlugins;
  const remarkRehypeOptions = options.remarkRehypeOptions
    ? { ...options.remarkRehypeOptions, ...emptyRemarkRehypeOptions }
    : emptyRemarkRehypeOptions;
  const skipHtml = options.skipHtml;
  const urlTransformer = options.urlTransformer || defaultUrlTransformer;

  const processor = unified()
    .use(remarkParse)
    .use(remarkPlugins)
    .use(remarkRehype, remarkRehypeOptions)
    .use(rehypePlugins);

  const file = new VFile();
  file.value = note;

  const mdastTree = processor.parse(file);
  let hastTree: Nodes = processor.runSync(mdastTree, file);

  // Wrap in `div` if there’s a class name.
  if (className) {
    hastTree = {
      type: 'element',
      tagName: 'div',
      properties: { className },
      // @ts-ignore
      children: hastTree.type === 'root' ? hastTree.children : [hastTree],
    };
  }

  const transform: Visitor<any> = (node, index, parent): VisitorResult => {
    if (node.type === 'raw' && parent && typeof index === 'number') {
      if (skipHtml) {
        parent.children.splice(index, 1);
      } else {
        // @ts-ignore
        parent.children[index] = { type: 'text', value: node.value };
      }

      return index;
    }

    if (node.type === 'element') {
      let key: string;

      for (key in urlAttributes) {
        if (
          Object.hasOwn(urlAttributes, key) &&
          Object.hasOwn(node.properties, key)
        ) {
          const value = node.properties[key];
          const test = urlAttributes[key];
          if (test === null || test.includes(node.tagName)) {
            node.properties[key] = urlTransformer(
              String(value || ''),
              key,
              node,
            );
          }
        }
      }
    }
  };

  visit(hastTree as any, transform);

  return { mdastTree, hastTree };
};

export const getNoteHeadings = (mdastTree: Root) => {
  const result = toc(mdastTree);
  const map = result.map;
  return map ? map.children : [];
};

/**
 * Make a URL safe.
 *
 */
function defaultUrlTransformer(value: string): string {
  // Same as:
  // <https://github.com/micromark/micromark/blob/929275e/packages/micromark-util-sanitize-uri/dev/index.js#L34>
  // But without the `encode` part.
  const colon = value.indexOf(':');
  const questionMark = value.indexOf('?');
  const numberSign = value.indexOf('#');
  const slash = value.indexOf('/');

  if (
    // If there is no protocol, it’s relative.
    colon < 0 ||
    // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
    (slash > -1 && colon > slash) ||
    (questionMark > -1 && colon > questionMark) ||
    (numberSign > -1 && colon > numberSign) ||
    // It is a protocol, it should be allowed.
    safeProtocol.test(value.slice(0, colon))
  ) {
    return value;
  }

  return '';
}

const obsidianCommentTextTransformer: TextTransformer = note => {
  return note;
};
