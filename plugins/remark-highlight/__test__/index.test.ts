import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, test } from 'vitest';
import remarkHighlight from '../index';

const process = async (md: string) => {
  const html = (
    await unified()
      .use(remarkParse)
      .use(remarkHighlight)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify)
      .process(md)
  ).toString();

  console.log(html);

  return html;
};

describe('remarkHighlight', () => {
  test('should ignore single equal sign', async () => {
    expect(await process('a =b=')).toMatchInlineSnapshot('"<p>a =b=</p>"');
  });

  test('should parse with correct syntax', async () => {
    expect(await process('a ==b = c==')).toMatchInlineSnapshot(
      '"<p>a <mark>b = c</mark></p>"',
    );
  });

  test('should support several adjacent marks', async () => {
    expect(await process('a ==b== ==c== ~~d~~')).toMatchInlineSnapshot(
      '"<p>a <mark>b</mark> <mark>c</mark> ~~d~~</p>"',
    );
  });

  test('should preserve token inside highlighted', async () => {
    expect(await process('a ==**b**==')).toMatchInlineSnapshot(
      '"<p>a <mark><strong>b</strong></mark></p>"',
    );
  });

  test('should ignore mark in blockquote', async () => {
    expect(await process('```==a==```')).toMatchInlineSnapshot(
      '"<p><code>==a==</code></p>"',
    );
  });

  // TODO: Expand remark-highlight to support those syntaxes.
  // test('should support more equal signs at the beginning', async () => {
  //   expect(await process('===a==')).toMatchInlineSnapshot(
  //     '"<p><mark>=a</mark></p>"',
  //   );
  // });
  //
  // test('should support more equal signs at the end', async () => {
  //   expect(await process('==a===')).toMatchInlineSnapshot(
  //     '"<p><mark>a=</mark></p>"',
  //   );
  // });
  //
  // test('should support text with unwanted space at the end', async () => {
  //   expect(await process('==a ==')).toMatchInlineSnapshot(
  //     '"<p><mark>a </mark></p>"',
  //   );
  // });

  test('should ignore text with unwanted space at the beginning', async () => {
    expect(await process('== a==')).toMatchInlineSnapshot('"<p>== a==</p>"');
  });
});
