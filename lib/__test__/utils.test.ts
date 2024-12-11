import { assert, describe, test } from 'vitest';
import { getExt } from '../file';
import { decimalToBase62, murmurhash } from '../note';

describe('ext', () => {
  test('when filename is "" then should return ""', () => {
    assert.equal(getExt(''), '');
  });

  test('when filename is "name" then should return ""', () => {
    assert.equal(getExt('name'), '');
  });

  test('when filename is "name.txt" then should return "txt"', () => {
    assert.equal(getExt('name.txt'), 'txt');
  });

  test('when filename is ".htpasswd" then should return ""', () => {
    assert.equal(getExt('.htpasswd'), '');
  });

  test('when filename is "name.with.many.dots.ext" then should return "ext"', () => {
    assert.equal(getExt('name.with.many.dots.ext'), 'ext');
  });
});

describe('murmurhash', () => {
  test('given fixed seed and key, return fixed number', () => {
    const number = murmurhash('some characters', 900);
    assert.equal(number, 2202869210);
  });
});

describe('decimalToBase62', () => {
  test('given fixed decimal, return fixed base 62 string', () => {
    const s = decimalToBase62(2202869210);
    assert.equal(s, '2P50uY');
  });
});
