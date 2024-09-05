import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, test } from 'vitest';
import remarkHighlight from '../index';

const process = async (md: string) => {
  const html = (
    await unified()
      .use(remarkParse)
      .use(remarkHighlight)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify)
      .process(md)
  ).toString();

  console.log(html);

  return html;
};

describe('remarkHighlight', () => {
  test('plain text', async () => {
    const md = '==highlight==';
    const html = await process(md);
  });
});
