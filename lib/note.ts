import { TreeViewNode } from '@/components/types';
import config from '@/lib/config';
import { getExt, getFilename } from '@/lib/file';
import { BucketItem, NoteObject } from '@/lib/types';
import { logger } from './logger';

const log = logger.child({ module: 'lib:note' });

/**
 * Encode note name by
 *  1. Replacing all '+' by '%2B'
 *  2. Replacing all whitespaces by character '+'
 *
 * @param name note name. For example: '/some folder/some note+.md' will be encoded to '/some+folder/some+note%2B.md'.
 * @return encoded note name.
 */
export const encodeNoteName = (name: string): string => {
  return name.replaceAll('+', '%2B').replaceAll(' ', '+');
};

export const decodeNoteName = (encoded: string): string => {
  return encoded.replaceAll('+', ' ').replaceAll('%2B', '+');
};

/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
export const murmurhash = (key: string, seed: number = 965): number => {
  const remainder = key.length & 3, // key.length % 4
    bytes = key.length - remainder,
    c1 = 0xcc9e2d51,
    c2 = 0x1b873593;

  let i = 0,
    k1,
    h1b,
    h1 = seed;

  while (i < bytes) {
    k1 =
      (key.charCodeAt(i) & 0xff) |
      ((key.charCodeAt(++i) & 0xff) << 8) |
      ((key.charCodeAt(++i) & 0xff) << 16) |
      ((key.charCodeAt(++i) & 0xff) << 24);
    ++i;

    k1 =
      ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 =
      ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1b =
      ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
    h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
  }

  k1 = 0;

  switch (remainder) {
    case 3:
      k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
      break;
    case 2:
      k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
      break;
    case 1:
      k1 ^= key.charCodeAt(i) & 0xff;
      k1 =
        ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) &
        0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 =
        ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) &
        0xffffffff;
      h1 ^= k1;
  }

  h1 ^= key.length;

  h1 ^= h1 >>> 16;
  h1 =
    ((h1 & 0xffff) * 0x85ebca6b +
      ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) &
    0xffffffff;
  h1 ^= h1 >>> 13;
  h1 =
    ((h1 & 0xffff) * 0xc2b2ae35 +
      ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) &
    0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
};

export const decimalToBase62 = (decimal: number): string => {
  const charset =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let base62 = '';

  if (decimal === 0) {
    return '0';
  }

  while (decimal > 0) {
    base62 = charset[decimal % 62] + base62;
    decimal = Math.floor(decimal / 62);
  }

  return base62;
};

export const base64Encode = (text: string) => {
  return Buffer.from(text).toString('base64');
};

export const base64Decode = (text: string) => {
  return Buffer.from(text, 'base64').toString();
};

/**
 * Convert note name to a unique string with base-62 format.
 *
 * @param name note name
 */
export const getNoteId = (name: string): string =>
  decimalToBase62(murmurhash(name));

export const getNotePath = (name: string): string => encodeNoteName(name);

export const getNoteSlugsFromPath = (path: string): string[] => path.split('/');

export const getEncodedNoteNameFromSlug = (slugs: string[]) => slugs.join('/');

export const getNoteTreeView = (noteObjects: NoteObject[]): TreeViewNode[] => {
  const _root: TreeViewNode = {
    name: 'root',
    path: '',
    children: [],
    isDir: true,
  };

  noteObjects.forEach(noteObject => {
    // note: 'a/b/c.md' or directory: 'a/b/c' => ['a', 'b', 'c.md'] or 'a/b/c' => ['a', 'b', 'c']
    const splits = noteObject.name.split('/');
    // ['a', 'b']
    const dirs: string[] = splits.slice(0, -1);
    let currentNode = _root;

    /**
     * Use depth-first algorithm to find noteObject's parent node. If the parent node doesn't exist, create it.
     *
     * Example: { id: '_root', isDir: true, children: [{id: 'a', isDir: true, children: [{id: 'b', isDir: true, children: []}]}]}.
     * If we want to create node with id 'c', we need to find/create node with id 'b' first. And, If
     * we want to find or create node with id 'b', we need to find/create node with id 'a' first. That's
     * why we use depth-first search.
     */
    dirs.forEach(dir => {
      let dirNode = currentNode.children.find(
        node => node.name === dir && node.isDir,
      );

      if (!dirNode) {
        dirNode = {
          name: dir,
          path: dir,
          children: [],
          isDir: true,
        };
        currentNode.children.push(dirNode);

        // sort all nodes after any new node added
        currentNode.children.sort((a, b) => {
          if (a.isDir && !b.isDir) {
            return -1;
          } else if (!a.isDir && b.isDir) {
            return 1;
          }
          return a.name.localeCompare(b.name, 'zh');
        });
      }

      currentNode = dirNode;
    });

    // c is a directory
    if (noteObject.type === 'dir') {
      const childDir = splits[splits.length - 1];
      currentNode.children.push({
        name: childDir,
        path: childDir,
        children: [],
        isDir: true,
      });
    }

    // c is a file
    if (noteObject.type === 'file') {
      const filename: string = splits[splits.length - 1];
      currentNode.children.push({
        name: getFilename(filename),
        path: encodeNoteName(noteObject.name),
        children: [],
        isDir: false,
      });
    }

    // sort all nodes after any new node added
    currentNode.children.sort((a, b) => {
      if (a.isDir && !b.isDir) {
        return -1;
      } else if (!a.isDir && b.isDir) {
        return 1;
      }
      return a.name.localeCompare(b.name, 'zh');
    });
  });

  return _root.children;
};

export const decodeURISlug = (slug: string[]) =>
  slug.map(s => decodeURIComponent(s));

export const listExistedNotes = (objs: BucketItem[]): NoteObject[] => {
  return objs
    .filter(obj => obj.isLatest && !obj.isDeleteMarker)
    .filter(obj => !config.dir.excluded.includes(obj.name.split('/')[0]))
    .map(obj => ({
      name: obj.name,
      ext: getExt(obj.name),
      type: 'file',
    }));
};

export const listExistedNoteNames = (objs: BucketItem[]): string[] => {
  return objs
    .filter(obj => obj.isLatest && !obj.isDeleteMarker)
    .filter(obj => !config.dir.excluded.includes(obj.name.split('/')[0]))
    .map(obj => obj.name);
};
