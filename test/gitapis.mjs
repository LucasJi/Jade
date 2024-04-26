// export interface TreeNode {
//   id: string;
//   name: string;
//   children?: TreeNode[];
//   isDir: boolean;
// }

const buildTree = treeData => {
  const tree = {
    name: 'root',
    children: [],
    isDir: true,
  };

  treeData.forEach(item => {
    if (item.type === 'tree') {
      tree.push({
        name: item.path,
        children: [],
        isDir: true,
      });
    }

    if (item.type === 'blob') {
      const pathParts = item.path.split('/');
      const dirs = pathParts.slice(0, -1);
      let currentNode = tree;
      dirs.forEach(dir => {
        let dirNode = currentNode.find(node => node.name === dir && node.isDir);

        if (!dirNode) {
          dirNode = {
            name: dir,
            children: [],
            isDir: true,
          };
          currentNode.push(dirNode);
        }

        currentNode = dirNode;
      });
    }
  });
  return tree;
};

const treeApi = () =>
  fetch(
    'https://api.github.com/repos/LucasJi/galaxy-feature-posts/git/trees/main?recursive=1',
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization:
          'Bearer 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',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  )
    .then(resp => resp.json())
    .then(data => {
      const { tree } = data;
      console.log(tree);
      // const treeObj = buildTree(tree);
      // console.log(treeObj);
    });

treeApi();

const contentApi = () =>
  fetch(
    'https://api.github.com/repos/LucasJi/galaxy-feature-posts/contents/Demo/Demo.md',
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization:
          'Bearer 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',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  )
    .then(resp => resp.json())
    .then(data => console.log(data));

// contentApi();
