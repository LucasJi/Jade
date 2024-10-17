import { trimEnd } from 'lodash';
import { decimalToBase62, getFileExt, murmurhash } from './utils';

/**
 * Encode note name by replacing whitespaces with char '-' and removing file extension.
 *
 * @param name note name. For example: '/path/some note.md'
 * @return encoded note name. For example: '/path/some-note'
 */
export const encodeNoteName = (name: string): string => {
  const ext = getFileExt(name);
  const nameWithoutExt = trimEnd(name, '.' + ext);
  return nameWithoutExt.split(' ').join('-');
};

/**
 * Convert note name to a unique string with base-62 format.
 *
 * @param name note name
 */
export const getNoteId = (name: string): string =>
  decimalToBase62(murmurhash(name));

/**
 * Get note path by note name.
 * For example, given note name '/path/some note.md' then returns '/path/some-note-2P50uY'.
 *
 * @param name note name
 */
export const getNotePath = (name: string): string =>
  encodeNoteName(name) + '-' + getNoteId(name);
