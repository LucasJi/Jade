import { NoteObject, TreeViewNode } from '@types';
import { trimEnd } from 'lodash';
import { Client } from 'minio';
import config from './config';
import { SEP } from './constants';
import { logger } from './logger';
import { listLatestExistingObjects } from './s3';
import { decimalToBase62, getFileExt, murmurhash } from './utils';

const log = logger.child({ module: 'lib:note' });

export const getNoteNameWithoutExt = (name: string): string => {
  const ext = getFileExt(name);
  return trimEnd(name, '.' + ext);
};

/**
 * Encode note name by
 *  1. Replacing all '+' by '%2B'
 *  2. Replacing all whitespaces by character '+'
 *
 * @param name note name. For example: '/some folder/some note+.md' will be encoded to '/some+folder/some+note%2B'.
 * @return encoded note name.
 */
export const encodeNoteName = (name: string): string => {
  return getNoteNameWithoutExt(name)
    .replaceAll('+', '%2B')
    .replaceAll(' ', '+');
};

export const decodeNotePath = (path: string): string => {
  return path.replaceAll('+', ' ').replaceAll('%2B', '+');
};

/**
 * Convert note name to a unique string with base-62 format.
 *
 * @param name note name
 */
export const getNoteId = (name: string): string =>
  decimalToBase62(murmurhash(name));

export const getNotePath = (name: string): string => encodeNoteName(name);

export const getNoteTreeView = (noteObjects: NoteObject[]): TreeViewNode[] => {
  const _root: TreeViewNode = {
    name: 'root',
    path: '',
    children: [],
    isDir: true,
  };

  noteObjects.forEach(noteObject => {
    // note: 'a/b/c.md' or directory: 'a/b/c' => ['a', 'b', 'c.md'] or 'a/b/c' => ['a', 'b', 'c']
    const splits = noteObject.name.split(SEP);
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
        path: getNotePath(noteObject.name),
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

const listNoteObjectsRemotely = async (
  s3Client: Client,
  excluded: string[],
): Promise<NoteObject[]> => {
  return listLatestExistingObjects(s3Client)(config.s3.bucket).then(objs =>
    objs
      .filter(obj => !excluded.includes(obj.name.split('/')[0]))
      .map(obj => ({
        name: obj.name,
        ext: getFileExt(obj.name),
        type: 'file',
      })),
  );
};

export const listNoteObjects = async (
  s3Client: Client,
): Promise<NoteObject[]> => {
  // if (dir.root) {
  //   log.info(
  //     `Load vault from local dir: ${dir.root}. Those folders will be ignored: ${dir.excluded}`,
  //   );
  //   return loadLocalVaultFilePathItems(dir.root, dir.root, dir.excluded);
  // }

  return listNoteObjectsRemotely(s3Client, config.dir.excluded).then(objs => {
    log.info(
      {
        noteObjSize: objs.length,
        from: 'remote',
        excludedDirs: config.dir.excluded,
        bucket: config.s3.bucket,
      },
      'List note objects',
    );
    return objs;
  });
};
