import { readFileSync } from 'fs';
import { micromark } from 'micromark';
import path from 'path';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { assert, describe, test } from 'vitest';
import { commentSyntax } from '../index';

const mdPath = path.join(__dirname, 'test.md');
const md = readFileSync(mdPath);

describe('micromark', () => {
  test('comment in paragraph', () => {
    const result = micromark('%%comment%%', {
      extensions: [commentSyntax()],
    });

    assert.equal(result, '<p>comment</p>');
  });

  test('comment(contains %) in paragraph', () => {
    const result = micromark('%%c%omment%%', {
      extensions: [commentSyntax()],
    });

    assert.equal(result, '<p>c%omment</p>');
  });

  test('comment(contains spaces and tabs) in paragraph', () => {
    const result = micromark('%%  comment  %%', {
      extensions: [commentSyntax()],
    });

    assert.equal(result, '<p>comment</p>');
  });

  test('comment(start with %) in paragraph', () => {
    const result = micromark('%%%comment%%', {
      extensions: [commentSyntax()],
    });

    assert.equal(result, '<p>%comment</p>');
  });

  test('comment(end with %) in paragraph', () => {
    const result = micromark('%%comment%%%', {
      extensions: [commentSyntax()],
    });

    assert.equal(result, '<p>comment%</p>');
  });

  test('comment(with %%) in paragraph', () => {
    const result = micromark('%%comment%%%%', {
      extensions: [commentSyntax()],
    });

    assert.equal(result, '<p>comment%%</p>');
  });

  test('comment in inline block', () => {
    const result = micromark('`inline: %%comment%%`', {
      extensions: [commentSyntax()],
    });

    assert.equal(result, '<p><code>inline: %%comment%%</code></p>');
  });

  test('comment in multi lines', () => {
    const result = micromark('%%\ncomment\n%%', {
      extensions: [commentSyntax()],
    });

    console.log(result);
    assert.equal(result, '<p>%%\ncomment\n%%</p>');
  });

  test('complex', () => {
    const result = micromark(md, {
      extensions: [commentSyntax()],
    });

    console.log(result);
  });
});

describe('remark-comment', () => {
  test('test', async () => {
    const html = (
      await unified()
        .use(remarkParse)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeStringify)
        .process(md)
    ).toString();

    console.log(html);
  });
});
