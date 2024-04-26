import { exec } from 'child_process';

// Function to execute Git command and parse tree data
function getGitTree(repoPath) {
  return new Promise((resolve, reject) => {
    exec('git ls-tree -r HEAD', { cwd: repoPath }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      const treeData = stdout
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          const [mode, type, hash, ...pathParts] = line.split(/\s+/);
          const path = pathParts.join(' ');
          return { mode, type, hash, path };
        });
      resolve(treeData);
    });
  });
}

// Recursive function to build tree structure
function buildTree(treeData, pathSeparator = '/') {
  const tree = {};
  treeData.forEach(item => {
    const pathParts = item.path.split(pathSeparator);
    let currentNode = tree;
    pathParts.forEach(part => {
      if (!currentNode[part]) {
        currentNode[part] = {};
      }
      currentNode = currentNode[part];
    });
    currentNode._mode = item.mode;
    currentNode._type = item.type;
    currentNode._hash = item.hash;
  });
  return tree;
}

// Example usage
const repoPath = '/home/lucas/projects/posts';
getGitTree(repoPath)
  .then(treeData => {
    const tree = buildTree(treeData);
    console.log(tree); // Output the tree structure
  })
  .catch(error => {
    console.error('Error:', error);
  });
