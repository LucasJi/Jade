import { assert, describe, test } from 'vitest';
import { getRoutePathFromVaultPath } from '../note';

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

  test('map Chinese character to pinyin', () => {
    const result = getRoutePathFromVaultPath('测试/some 标注.md');
    console.log(result);
  });
});
