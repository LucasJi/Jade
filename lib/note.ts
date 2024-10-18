import { SEP } from '@/lib/constants';
import { NoteObject, TreeViewNode } from '@types';
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

export const getNoteTreeView = (paths: NoteObject[]): TreeViewNode[] => {
  const tree: TreeViewNode = {
    id: 'root',
    name: 'root',
    children: [],
    isDir: true,
  };

  paths.forEach(item => {
    // 'a/b/c.md' => ['a', 'b', 'c.md'] or 'a/b/c' => ['a', 'b', 'c']
    const pathParts = item.name.split(SEP);
    // ['a', 'b']
    const dirs: string[] = pathParts.slice(0, -1);
    let currentNode = tree;

    /**
     * Use depth-first algorithm to find item's parent node. If the parent node doesn't exist, create it.
     *
     * Example: { id: 'root', isDir: true, children: [{id: 'a', isDir: true, children: [{id: 'b', isDir: true, children: []}]}]}.
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
          id: dir,
          name: dir,
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
    if (item.type === 'dir') {
      const childDir = pathParts[pathParts.length - 1];
      currentNode.children.push({
        id: childDir,
        name: childDir,
        children: [],
        isDir: true,
      });
    }

    // c is a file
    if (item.type === 'file') {
      const file: string = pathParts[pathParts.length - 1];
      const ext = item.ext;
      const extPosition = file.lastIndexOf(ext);
      const name = file.slice(0, extPosition - 1);
      currentNode.children.push({
        id: item.name,
        name,
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

  return tree.children;
};
