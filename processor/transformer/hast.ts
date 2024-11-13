import { Nodes } from 'hast';
import { urlAttributes } from 'html-url-attributes';
import { Root } from 'mdast';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkRehype from 'remark-rehype';
import { PluggableList, unified } from 'unified';
import { Visitor, VisitorResult, visit } from 'unist-util-visit';
import { VFile } from 'vfile';

const rehypePlugins: PluggableList = [
  rehypeRaw as any,
  [rehypeKatex, { strict: false }],
  rehypeSlug,
];

const skipHtml = false;
/**
 * Make a URL safe.
 *
 */
const makeUrlSafe = (value: string): string => {
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

const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i;

const visitor: Visitor<any> = (node, index, parent): VisitorResult => {
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
          node.properties[key] = makeUrlSafe(String(value || ''));
        }
      }
    }
  }
};

export const transformUrls = (hast: Nodes) => {
  visit(hast as any, visitor);
};

const createUnifiedProcessor = () => {
  return unified()
    .use(remarkRehype, {
      allowDangerousHtml: true,
    })
    .use(rehypePlugins);
};

export const transformMdastToHast = (mdast: Root, vFile: VFile) => {
  const processor = createUnifiedProcessor();
  return processor.runSync(mdast, vFile);
};
