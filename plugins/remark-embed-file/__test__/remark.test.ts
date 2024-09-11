import { JSDOM } from 'jsdom';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { beforeAll, describe, expect, test } from 'vitest';
import { remarkEmbedFile } from '../index';

const process = async (md: string) => {
  const html = (
    await unified()
      .use(remarkParse)
      .use(remarkEmbedFile)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify)
      .process(md)
  ).toString();

  console.log('html:', html);

  return html;
};

describe('remarkEmbedFile', () => {
  let jsdom: JSDOM;
  let parser: DOMParser;

  beforeAll(() => {
    jsdom = new JSDOM();
    parser = new jsdom.window.DOMParser();
  });

  test('valid syntax', async () => {
    const html = await process('![[file]]');
    const doc = parser.parseFromString(html, 'text/html');
    const section = doc.querySelector('section');
    expect(section).not.toBe(null);
    expect(section?.getAttribute('data-embed-file')).not.toBeNull();
  });

  test('invalid syntax', async () => {
    const html = await process('![file]]');
    const doc = parser.parseFromString(html, 'text/html');
    const section = doc.querySelector('section');
    expect(section).toBe(null);
  });
});
