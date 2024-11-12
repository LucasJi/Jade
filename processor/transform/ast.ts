import { remarkCallout } from '@/plugins/remark-callout';
import remarkHighlight from '@/plugins/remark-highlight';
import { remarkTaskList } from '@/plugins/remark-task-list';
import { remarkWikilink } from '@/plugins/remark-wikilink';
import { frontYamlMatterHandler } from '@/plugins/unified-matter/plugin';
import { Transformer } from '@/processor/types';
import { Nodes } from 'hast';
import { urlAttributes } from 'html-url-attributes';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkBreaks from 'remark-breaks';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { PluggableList, unified } from 'unified';
import { Visitor, VisitorResult, visit } from 'unist-util-visit';
import { VFile } from 'vfile';

const defaultRemarkPlugins: PluggableList = [
  remarkFrontmatter,
  remarkGfm,
  remarkBreaks,
  remarkHighlight,
  remarkTaskList,
  remarkCallout,
  remarkMath,
  remarkWikilink,
];
const defaultRehypePlugins: PluggableList = [
  rehypeRaw as any,
  [rehypeKatex, { strict: false }],
  rehypeSlug,
];

const unifiedPlugins: PluggableList = [frontYamlMatterHandler];

const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i;

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

const skipHtml = false;

const transformUrls: Visitor<any> = (node, index, parent): VisitorResult => {
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

const createUnifiedProcessor = () => {
  return unified()
    .use(remarkParse)
    .use(defaultRemarkPlugins)
    .use(remarkRehype, {
      allowDangerousHtml: true,
    })
    .use(defaultRehypePlugins)
    .use(unifiedPlugins);
};

const createVFile = (note: string) => {
  const file = new VFile();
  file.value = note;
  return file;
};

/**
 * Transform note to mdast and hast
 */
export const transformNoteToAst = (
  options: Transformer.NoteToAstOptions,
): Transformer.NoteToAstResults => {
  const vFile = createVFile(options.note || '');

  const processor = createUnifiedProcessor();

  const mdast = processor.parse(vFile);
  const hast: Nodes = processor.runSync(mdast, vFile);

  visit(hast as any, transformUrls);

  const { matter } = vFile.data as any;

  return { mdast, hast, matter };
};
