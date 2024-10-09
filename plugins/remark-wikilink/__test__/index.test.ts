import { JSDOM } from 'jsdom';
import { micromark } from 'micromark';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { beforeAll, describe, expect, test } from 'vitest';
import { remarkWikilink, remarkWikilinkSyntax } from '../index';

const process = async (md: string) => {
  const html = (
    await unified()
      .use(remarkParse)
      .use(remarkWikilink)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify)
      .process(md)
  ).toString();

  console.log(html);

  return html;
};

describe('remarkWikilink', () => {
  let jsdom: JSDOM;
  let parser: DOMParser;

  beforeAll(() => {
    jsdom = new JSDOM();
    parser = new jsdom.window.DOMParser();
  });

  test('invalid syntax', async () => {
    const html = await process('[invalid syntax]');
    const doc = parser.parseFromString(html, 'text/html');
    const a = doc.querySelector('a');
    expect(a).toBeNull();
  });

  test('Link to a file', async () => {
    const filename = 'filename';
    const html = await process(`[[${filename}]]`);
    const doc = parser.parseFromString(html, 'text/html');
    const a = doc.querySelector('a');
    expect(a).not.toBeNull();
    expect(a?.getAttribute('data-wikilink')).not.toBeNull();
    expect(a?.getAttribute('href')).toBe(filename);
  });

  test('Linking to a heading within the same note', async () => {
    const html = await process('[[#heading]]');
    const doc = parser.parseFromString(html, 'text/html');
    const a = doc.querySelector('a');
    expect(a).not.toBeNull();
    expect(a?.getAttribute('data-wikilink')).not.toBeNull();
    expect(a?.getAttribute('href')).toBe('#heading');
  });

  test('Linking to a heading in another note', async () => {
    const html = await process('[[another file#heading]]');
    const doc = parser.parseFromString(html, 'text/html');
    const a = doc.querySelector('a');
    expect(a).not.toBeNull();
    expect(a?.getAttribute('data-wikilink')).not.toBeNull();
    expect(a?.getAttribute('href')).toBe('another file#heading');
  });

  test('Linking to subheadings', async () => {
    const html = await process('[[another file#heading#sub heading]]');
    const doc = parser.parseFromString(html, 'text/html');
    const a = doc.querySelector('a');
    expect(a).not.toBeNull();
    expect(a?.getAttribute('data-wikilink')).not.toBeNull();
    expect(a?.getAttribute('href')).toBe('another file#heading#sub heading');
  });

  test('Change the link display text', async () => {
    const html = await process('[[Internal links|custom display text]]');
    const doc = parser.parseFromString(html, 'text/html');
    const a = doc.querySelector('a');
    expect(a).not.toBeNull();
    expect(a?.getAttribute('data-wikilink')).not.toBeNull();
    expect(a?.getAttribute('href')).toBe('Internal links');
    expect(a?.innerHTML).toBe('custom display text');
  });
});

describe('micromark', () => {
  test('basic syntax', () => {
    const result = micromark('[[wikilink]]', {
      extensions: [remarkWikilinkSyntax()],
    });

    console.log(result);
    // assert.equal(result, '<p></p>');
  });
});
