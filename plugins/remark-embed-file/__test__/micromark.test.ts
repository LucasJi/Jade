import { micromark } from 'micromark';
import { assert, describe, test } from 'vitest';
import { embedFileSyntax } from '../index';

describe('micromark', () => {
  test('embed file', () => {
    const result = micromark('![[a]]', {
      extensions: [embedFileSyntax()],
    });

    assert.equal(result, '<p></p>');
  });

  test('invalid syntax - 1', () => {
    const result = micromark('[[a]]', {
      extensions: [embedFileSyntax()],
    });

    assert.equal(result, '<p>[[a]]</p>');
  });

  test('invalid syntax - 2', () => {
    const result = micromark('![[a]', {
      extensions: [embedFileSyntax()],
    });

    assert.equal(result, '<p>![[a]</p>');
  });

  test('valid syntax - 1', () => {
    const result = micromark('![[a]]]', {
      extensions: [embedFileSyntax()],
    });

    assert.equal(result, '<p>]</p>');
  });
});
