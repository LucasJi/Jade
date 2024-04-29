const buildTree = treeData => {
  const tree = {
    name: 'root',
    children: [],
    isDir: true,
  };

  treeData.forEach(item => {
    const pathParts = item.path.split('/');
    const dirs = pathParts.slice(0, -1);
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

      currentNode = dirNode;
    });

    if (item.type === 'tree') {
      const dir = pathParts[pathParts.length - 1];
      currentNode.children.push({
        name: dir,
        children: [],
        isDir: true,
      });
    }

    if (item.type === 'blob') {
      const file = pathParts[pathParts.length - 1];
      currentNode.children.push({
        name: file,
        children: [],
        isDir: false,
      });
    }
  });

  return tree.children;
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
      const treeObj = buildTree(tree);
      console.log(JSON.stringify(treeObj));
    });

// treeApi();

const contentApi = () =>
  fetch(
    'https://api.github.com/repos/LucasJi/galaxy-feature-posts/contents/Wikilink/Link to a heading in a note.md',
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
      console.log(data);
      console.log(atob(data.content));
    });

contentApi();
