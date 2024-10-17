import { assert, describe, test } from 'vitest';
import { decimalToBase62, getFileExt, murmurhash } from '../utils';

describe('ext', () => {
  test('when filename is "" then should return ""', () => {
    assert.equal(getFileExt(''), '');
  });

  test('when filename is "name" then should return ""', () => {
    assert.equal(getFileExt('name'), '');
  });

  test('when filename is "name.txt" then should return "txt"', () => {
    assert.equal(getFileExt('name.txt'), 'txt');
  });

  test('when filename is ".htpasswd" then should return ""', () => {
    assert.equal(getFileExt('.htpasswd'), '');
  });

  test('when filename is "name.with.many.dots.myext" then should return "myext"', () => {
    assert.equal(getFileExt('name.with.many.dots.myext'), 'myext');
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
