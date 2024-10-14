import { assert, describe, test } from 'vitest';
import { ext } from '../utils';

describe('ext', () => {
  test('when filename is "" then should return ""', () => {
    assert.equal(ext(''), '');
  });

  test('when filename is "name" then should return ""', () => {
    assert.equal(ext('name'), '');
  });

  test('when filename is "name.txt" then should return "txt"', () => {
    assert.equal(ext('name.txt'), 'txt');
  });

  test('when filename is ".htpasswd" then should return ""', () => {
    assert.equal(ext('.htpasswd'), '');
  });

  test('when filename is "name.with.many.dots.myext" then should return "myext"', () => {
    assert.equal(ext('name.with.many.dots.myext'), 'myext');
  });
});
