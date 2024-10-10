import { readFileSync } from 'fs';
import { fromMarkdown } from 'mdast-util-from-markdown';
import path from 'path';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, test } from 'vitest';
import { remarkComment } from '../plugin';

const mdPath = path.join(__dirname, 'demo.md');
const buffer = readFileSync(mdPath);
const md = buffer.toString();

const process = async (md: string) => {
  const html = (
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkComment)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify)
      .process(md)
  ).toString();

  console.log(html);

  return html;
};

describe('remarkComment', () => {
  test('should ignore single equal sign', async () => {
    const replaced = md.replaceAll(new RegExp(/%%[\s\S]*?%%/g), '');
    console.log(replaced);
    const tree = fromMarkdown(replaced);

    visit(tree as any, function (node, index, parent) {
      // console.log([node.value, parent?.type]);
    });
  });
});
