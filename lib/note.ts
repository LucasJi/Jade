import { TreeViewNode } from '@/components/types';
import config from '@/lib/config';
import { BucketItem, NoteObject } from '@/lib/types';
import { logger } from './logger';
import {
  decimalToBase62,
  getFileExt,
  getFilenameWithoutExt,
  murmurhash,
} from './utils';

const log = logger.child({ module: 'lib:note' });

export const getNoteNameWithoutExt = (name: string): string => {
  return getFilenameWithoutExt(name);
};

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
        name: getNoteNameWithoutExt(filename),
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
      ext: getFileExt(obj.name),
      type: 'file',
    }));
};

export const listExistedNoteNames = (objs: BucketItem[]): string[] => {
  return objs
    .filter(obj => obj.isLatest && !obj.isDeleteMarker)
    .filter(obj => !config.dir.excluded.includes(obj.name.split('/')[0]))
    .map(obj => obj.name);
};
