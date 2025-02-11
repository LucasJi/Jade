import { TreeViewNode } from '@/components/types';
import { getExt, getFilename } from '@/lib/file';
import { NoteObject } from '@/lib/types';
import { endsWith, startsWith } from 'lodash';
import { pinyin } from 'pinyin-pro';

export const getRoutePathFromVaultPath = (path: string): string => {
  const _path = path
    .replaceAll('+', '%2B')
    .replaceAll(' ', '+')
    .replaceAll('*', '%2A');

  const filename = getFilename(_path);
  const ext = getExt(_path);

  const segments = pinyin(filename, {
    toneType: 'none',
    type: 'array',
    nonZh: 'consecutive',
  });

  if (segments.length <= 0) {
    return '';
  }

  return (
    segments.reduce((pre, cur) => {
      if (startsWith(cur, '/')) {
        return `${pre}${cur}`;
      }

      if (endsWith(pre, '/') || endsWith(pre, '+')) {
        return `${pre}${cur}`;
      }

      return `${pre}*${cur}`;
    }) + `.${ext}`
  );
};

export const getRoutePathFromSlug = (slugs: string[]) => slugs.join('/');

export const getRoutePathFromURIComponentSlug = (slug: string[]) =>
  getRoutePathFromSlug(slug.map(e => decodeURIComponent(e)));

export const getNoteTreeView = (noteObjects: NoteObject[]): TreeViewNode[] => {
  const _root: TreeViewNode = {
    name: 'root',
    path: '',
    vaultPath: '',
    children: [],
    isDir: true,
  };

  noteObjects.forEach(noteObject => {
    // note: 'a/b/c.md' or directory: 'a/b/c' => ['a', 'b', 'c.md'] or 'a/b/c' => ['a', 'b', 'c']
    const splits = noteObject.path.split('/');
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
          vaultPath: '',
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
    // if (noteObject.type === 'dir') {
    //   const childDir = splits[splits.length - 1];
    //   currentNode.children.push({
    //     name: childDir,
    //     path: childDir,
    //     children: [],
    //     isDir: true,
    //   });
    // }

    // c is a file
    const filename: string = splits[splits.length - 1];
    currentNode.children.push({
      name: getFilename(filename),
      path: getRoutePathFromVaultPath(noteObject.path),
      vaultPath: noteObject.path,
      children: [],
      isDir: false,
    });

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
