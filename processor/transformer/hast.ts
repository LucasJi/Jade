import unifiedProcessor from '@/processor/unified';
import { Element, Root as HastRoot, Nodes } from 'hast';
import { toText } from 'hast-util-to-text';
import { urlAttributes } from 'html-url-attributes';
import { Root } from 'mdast';
import { removePosition } from 'unist-util-remove-position';
import { Visitor, VisitorResult, visit } from 'unist-util-visit';
import { VFile } from 'vfile';

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

export const truncateHast = (hast: HastRoot, headings: string[]) => {
  if (headings.length <= 0) {
    return;
  }

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const begin = hast.children.findIndex(
      child => child.type === 'element' && toText(child) === heading,
    );

    if (begin == -1) {
      return;
    }

    const end = hast.children.findIndex(
      (child, index) =>
        child.type === 'element' &&
        child.tagName === (hast.children[begin] as Element).tagName &&
        index > begin,
    );

    hast.children = hast.children.slice(
      begin,
      end === -1 ? hast.children.length : end,
    );
  }
};

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

const convertUnSafeUrls = (hast: Nodes) => {
  visit(hast as any, visitor);
};

const convertMdastToHast = (mdast: Root, vFile: VFile) => {
  const hast = unifiedProcessor.runSync(mdast, vFile);
  convertUnSafeUrls(hast);
  removePosition(hast, { force: true });
  return hast;
};

const hastTransformer = (mdast: Root, vFile: VFile) => {
  return convertMdastToHast(mdast, vFile);
};

export default hastTransformer;
