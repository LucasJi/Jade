import { Options } from '@/transformer/types';
import { Nodes } from 'hast';
import { urlAttributes } from 'html-url-attributes';
import { Root } from 'mdast';
import remarkParse from 'remark-parse';
import remarkRehype, { Options as RemarkRehypeOptions } from 'remark-rehype';
import { PluggableList, unified } from 'unified';
import { Visitor, VisitorResult, visit } from 'unist-util-visit';
import { VFile } from 'vfile';

const emptyPlugins: PluggableList = [];

const emptyRemarkRehypeOptions: Readonly<RemarkRehypeOptions> = {
  allowDangerousHtml: true,
};

const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i;

/**
 * Make a URL safe.
 *
 */
const defaultUrlTransformer = (value: string): string => {
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
};

/**
 * Transform note to hast tree
 * @param options
 */
export const astTransformer = (
  options: Options,
): { mdast: Root; hast: Nodes } => {
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

  const mdast = processor.parse(file);
  let hast: Nodes = processor.runSync(mdast, file);

  // Wrap in `div` if there’s a class name.
  if (className) {
    hast = {
      type: 'element',
      tagName: 'div',
      properties: { className },
      // @ts-ignore
      children: hast.type === 'root' ? hast.children : [hast],
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

  visit(hast as any, transform);

  return { mdast, hast };
};
