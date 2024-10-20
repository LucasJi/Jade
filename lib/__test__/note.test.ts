import { assert, describe, test } from 'vitest';
import {
  decodeNotePath,
  encodeNoteName,
  getNoteId,
  getNotePath,
} from '../note';
import { decimalToBase62, murmurhash } from '../utils';

describe('lib note', () => {
  test('encodeNoteName', () => {
    assert.equal(encodeNoteName('/folder/some note.md'), '/folder/some+note');
    assert.equal(encodeNoteName('/folder/something.md'), '/folder/something');
    assert.equal(
      encodeNoteName('/folder/some note++.md'),
      '/folder/some+note%2B%2B',
    );
  });

  test('decodeNotePath', () => {
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

  test('getNotePath', () => {
    const noteName = '/path/some note.md';
    assert.equal(getNotePath(noteName), '/path/some+note');
  });
});
