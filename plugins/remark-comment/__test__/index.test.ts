import { readFileSync } from 'fs';
import { micromark } from 'micromark';
import path from 'path';
import { assert, describe, test } from 'vitest';
import { commentHtml, commentSyntax } from '../index';

const mdPath = path.join(__dirname, 'test.md');
const md = readFileSync(mdPath);
const parser = (md: string) => {
  const result = micromark(md, {
    extensions: [commentSyntax()],
    htmlExtensions: [commentHtml()],
  });

  console.log(result);

  return result;
};

describe('micromark', () => {
  test('comment in paragraph', () => {
    assert.equal(parser('%%a%%'), '<p><div>a</div></p>');
  });

  test('comment(contains %) in paragraph', () => {
    assert.equal(parser('%%c%a%%'), '<p><div>c%a</div></p>');
  });

  test('comment(contains spaces and tabs) in paragraph', () => {
    assert.equal(parser('%%  a  %%'), '<p>%%  a  %%</p>');
  });

  test('comment(start with %) in paragraph', () => {
    assert.equal(parser('%%%comment%%'), '<p>%comment</p>');
  });

  test('comment(end with %) in paragraph', () => {
    assert.equal(parser('%%comment%%%'), '<p>comment%</p>');
  });

  test('comment in inline block', () => {
    assert.equal(
      parser('`inline: %%comment%%`'),
      '<p><code>inline: %%comment%%</code></p>',
    );
  });

  test('comment in multi lines', () => {
    assert.equal(parser('%%\ncomment\n%%'), '<p>%%\ncomment\n%%</p>');
  });
});
