import { assert, describe, test } from 'vitest';
import { getExt } from '../file';

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
