import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, test } from 'vitest';
import remarkComment from '../index';

const process = async (md: string) => {
  const html = (
    await unified()
      .use(remarkParse)
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
    await process('a %%b %%');
    // expect().toMatchInlineSnapshot('"<p>a =b=</p>"');
  });
});
