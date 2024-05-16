import { TreeNode } from '@/types';
import { base64Encode } from './common';
import { MD_SUFFIX_REG } from './constants';
import { getGitTree } from './getGitTree';

const buildTree = (treeData: any[]): TreeNode[] => {
  const tree: TreeNode = {
    name: 'root',
    children: [],
    isDir: true,
  };

  treeData.forEach(item => {
    const pathParts = item.path.split('/');
    const dirs: string[] = pathParts.slice(0, -1);
    let currentNode = tree;

    // find or create nodes for directories
    dirs.forEach(dir => {
      let dirNode = currentNode.children.find(
        node => node.name === dir && node.isDir,
      );

      if (!dirNode) {
        dirNode = {
          name: dir,
          children: [],
          isDir: true,
        };

        currentNode.children.push(dirNode);
      }

      currentNode.children.sort((a, b) => {
        if (a.isDir && !b.isDir) {
          return -1;
        } else if (!a.isDir && b.isDir) {
          return 1;
        }
        return a.name.localeCompare(b.name);
      });

      currentNode = dirNode;
    });

    if (item.type === 'tree') {
      const childDir = pathParts[pathParts.length - 1];
      currentNode.children.push({
        name: childDir,
        children: [],
        isDir: true,
      });
    }

    if (item.type === 'blob') {
      const file: string = pathParts[pathParts.length - 1];
      currentNode.children.push({
        path: base64Encode(item.path),
        name: file.replace(MD_SUFFIX_REG, ''),
        children: [],
        isDir: false,
      });
    }
  });

  return tree.children;
};

export const getPostTree = async (): Promise<TreeNode[]> => {
  return getGitTree().then(tree => {
    return buildTree(tree);
  });
};
