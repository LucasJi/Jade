import { micromark } from 'micromark';
import { assert, describe, test } from 'vitest';
import { remarkEmbedFileSyntax } from '../index';

describe('micromark', () => {
  test('embed file', () => {
    const result = micromark('![[a]]', {
      extensions: [remarkEmbedFileSyntax()],
    });

    assert.equal(result, '<p></p>');
  });

  test('invalid syntax - 1', () => {
    const result = micromark('[[a]]', {
      extensions: [remarkEmbedFileSyntax()],
    });

    assert.equal(result, '<p>[[a]]</p>');
  });

  test('invalid syntax - 2', () => {
    const result = micromark('![[a]', {
      extensions: [remarkEmbedFileSyntax()],
    });

    assert.equal(result, '<p>![[a]</p>');
  });

  test('valid syntax - 1', () => {
    const result = micromark('![[a]]]', {
      extensions: [remarkEmbedFileSyntax()],
    });

    assert.equal(result, '<p>]</p>');
  });
});
