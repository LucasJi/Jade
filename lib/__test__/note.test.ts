import pinyin from 'pinyin';
import { assert, describe, test } from 'vitest';
import {
  decimalToBase62,
  decodeNotePath,
  encodeNotePath,
  getNoteId,
  murmurhash,
} from '../note';

describe('lib:note', () => {
  test('encodeNoteName', () => {
    assert.equal(
      encodeNotePath('/folder/some note.md'),
      '/folder/some+note.md',
    );
    assert.equal(
      encodeNotePath('/folder/something.md'),
      '/folder/something.md',
    );
    assert.equal(
      encodeNotePath('/folder/some note++.md'),
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

  test('getNoteId', () => {
    const noteName = '/path/some note.md';
    assert.equal(getNoteId(noteName), decimalToBase62(murmurhash(noteName)));
  });

  test('map Chinese character to pinyin', () => {
    console.log(
      pinyin('/某个文件夹/某个文件.md', {
        heteronym: false,
        group: false,
        style: 0,
      }),
    );
  });
});
