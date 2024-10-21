import { assert, describe, test } from 'vitest';
import {
  decodeNoteName,
  encodeNoteName,
  getNoteId,
  getNotePath,
} from '../note';
import { decimalToBase62, murmurhash } from '../utils';

describe('lib note', () => {
  test('encodeNoteName', () => {
    assert.equal(
      encodeNoteName('/folder/some note.md'),
      '/folder/some+note.md',
    );
    assert.equal(
      encodeNoteName('/folder/something.md'),
      '/folder/something.md',
    );
    assert.equal(
      encodeNoteName('/folder/some note++.md'),
      '/folder/some+note%2B%2B.md',
    );
  });

  test('decodeNoteName', () => {
    assert.equal(decodeNoteName('/folder/some+note'), '/folder/some note');
    assert.equal(decodeNoteName('/folder/something'), '/folder/something');
    assert.equal(
      decodeNoteName('/folder/some+note%2B%2B'),
      '/folder/some note++',
    );
  });

  test('getNoteId', () => {
    const noteName = '/path/some note.md';
    assert.equal(getNoteId(noteName), decimalToBase62(murmurhash(noteName)));
  });

  test('getNotePath', () => {
    const noteName = '/path/some note.md';
    assert.equal(getNotePath(noteName), '/path/some+note.md');
  });
});
