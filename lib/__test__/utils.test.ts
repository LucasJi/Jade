import { assert, describe, test } from 'vitest';
import { getFileExt } from '../utils';

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
