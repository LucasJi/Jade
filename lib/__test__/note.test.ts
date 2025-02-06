import { assert, describe, test } from 'vitest';
import { decodeNotePath, getRoutePathFromVaultPath } from '../note';

describe('lib:note', () => {
  test('encodeNoteName', () => {
    assert.equal(
      getRoutePathFromVaultPath('/folder/some note.md'),
      '/folder/some+note.md',
    );
    assert.equal(
      getRoutePathFromVaultPath('/folder/something.md'),
      '/folder/something.md',
    );
    assert.equal(
      getRoutePathFromVaultPath('/folder/some note++.md'),
      '/folder/some+note%2B%2B.md',
    );
  });

  test('decodeNoteName', () => {
    assert.equal(decodeNotePath('/folder/some+note'), '/folder/some note');
    assert.equal(decodeNotePath('/folder/something'), '/folder/something');
    assert.equal(
      decodeNotePath('/folder/some+note%2B%2B'),
      '/folder/some note++',
    );
  });

  test('map Chinese character to pinyin', () => {
    const result = getRoutePathFromVaultPath('测试/some 标注.md');
    console.log(result);
  });
});
