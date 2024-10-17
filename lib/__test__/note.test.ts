import { assert, describe, test } from 'vitest';
import { encodeNoteName, getNoteId, getNotePath } from '../note';
import { decimalToBase62, murmurhash } from '../utils';

describe('lib note', () => {
  test('encodeNoteName', () => {
    assert.equal(encodeNoteName('/path/some note.md'), '/path/some-note');
    assert.equal(encodeNoteName('/path/some-note.md'), '/path/some-note');
    assert.equal(
      encodeNoteName('/path/some note-with more-whitespaces.md'),
      '/path/some-note-with-more-whitespaces',
    );
  });

  test('getNoteId', () => {
    const noteName = '/path/some note.md';
    assert.equal(getNoteId(noteName), decimalToBase62(murmurhash(noteName)));
  });

  test('getNotePath', () => {
    const noteName = '/path/some note.md';
    assert.equal(
      getNotePath(noteName),
      '/path/some-note-' + getNoteId(noteName),
    );
  });
});
