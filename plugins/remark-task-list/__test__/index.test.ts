import { JSDOM } from 'jsdom';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { beforeAll, describe, expect, test } from 'vitest';
import remarkTaskList from '../index';

const process = async (md: string) => {
  const html = (
    await unified()
      .use(remarkParse)
      .use(remarkTaskList)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify)
      .process(md)
  ).toString();

  console.log(html);

  return html;
};

describe('remarkTaskList', () => {
  let jsdom: JSDOM;
  let parser: DOMParser;

  beforeAll(() => {
    jsdom = new JSDOM();
    parser = new jsdom.window.DOMParser();
  });

  test('checked', async () => {
    const html = await process('- [x] foo');
    const doc = parser.parseFromString(html, 'text/html');
    const checkbox = doc.querySelector('input[type=checkbox]');
    expect(checkbox).not.toBe(null);
    expect(checkbox?.getAttribute('checked')).not.toBeNull();
  });

  test('not checked', async () => {
    const html = await process('- [ ] foo');
    const doc = parser.parseFromString(html, 'text/html');
    const checkbox = doc.querySelector('input[type=checkbox]');
    expect(checkbox).not.toBe(null);
    expect(checkbox?.getAttribute('checked')).toBeNull();
  });

  test('invalid syntax(- [] foo)', async () => {
    const html = await process('- [] foo');
    const doc = parser.parseFromString(html, 'text/html');
    const ul = doc.querySelector('.contains-task-list');
    expect(ul).toBe(null);
  });

  test('checked with any character(*)', async () => {
    const html = await process('- [*] foo');
    const doc = parser.parseFromString(html, 'text/html');
    const checkbox = doc.querySelector('input[type=checkbox]');
    expect(checkbox).not.toBe(null);
    expect(checkbox?.getAttribute('checked')).not.toBeNull();
  });

  test('checked with any character(\\)', async () => {
    const html = await process('- [\\] foo');
    const doc = parser.parseFromString(html, 'text/html');
    const checkbox = doc.querySelector('input[type=checkbox]');
    expect(checkbox).not.toBe(null);
    expect(checkbox?.getAttribute('checked')).not.toBeNull();
  });
});
