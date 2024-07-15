import fs from "fs";
import {join, sep} from "path";

// path separator
const SEPARATOR = '/';

// find Markdown mark "#"
const MD_TITLE_REG = /^#\s+.+/;

// find Markdown file "xxx.md"
const MD_SUFFIX_REG = /\.md$/;

// find Markdown heading marks: "#", "##", "###", "####", "#####", "######"
const MD_HEADING_REG = /^(#{1,6})\s+.+/;

const POST_DIR = join(process.cwd(), '_posts', SEPARATOR);

const base64Encode = (text) => {
  return Buffer.from(text).toString('base64');
};

const base64Decode = (text) => {
  return Buffer.from(text, 'base64').toString();
};

const rootDir = 'C:\\Projects\\obsidian-chinese-help';
const ignoreDirs = ['.git']

const getMarkdownAbsolutePaths = (
    dir = rootDir,
    absolutePaths = [],
) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const path = join(dir, file);
    if (fs.statSync(path).isDirectory()) {
      if (ignoreDirs.includes(file)) {
        continue;
      }
      absolutePaths.push(
          {path: path.replace(rootDir + sep, ''), type: 'tree'});
      getMarkdownAbsolutePaths(path, absolutePaths);
    } else if (file.endsWith('.md')) {
      absolutePaths.push({path: path.replace(rootDir + sep, ''), type: 'blob'});
    }
  }

  return absolutePaths;
};

const paths = getMarkdownAbsolutePaths()

// console.log(paths.reverse())

const buildTree = (treeData) => {
  const tree = {
    name: 'root',
    children: [],
    isDir: true,
  };

  treeData.forEach(item => {
    const pathParts = item.path.split(sep);
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
      const file = pathParts[pathParts.length - 1];
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

const tree = buildTree(paths)
// console.log(tree)

const filename = base64Decode(
    '57uE57uH5L+h5oGv55qET2JzaWRpYW7lrp7ot7Xlu7rnq4vkuJPkuJrljZrlrabnmoTnn6Xor4blnLDlm74gYnkgRWNob19TRUwubWQ=')

const content = fs.readFileSync(join(rootDir, filename), 'utf8');
console.log(content)
