/* eslint-disable no-console */
import { Note, NoteGraph, NoteObject, TreeNode } from '@types';
import { Root } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toc } from 'mdast-util-toc';
import * as os from 'node:os';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import { VFile } from 'vfile';
import { matter } from 'vfile-matter';
import { MD_EXT_REG, MD_HEADING_REG, MD_TITLE_REG, SEP } from './constants';

export const buildNoteTree = (paths: NoteObject[]): TreeNode[] => {
  const tree: TreeNode = {
    id: 'root',
    name: 'root',
    children: [],
    isDir: true,
  };

  paths.forEach(item => {
    // 'a/b/c.md' => ['a', 'b', 'c.md'] or 'a/b/c' => ['a', 'b', 'c']
    const pathParts = item.path.split(SEP);
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
        id: item.id,
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

export const removeTitle = (content: string) => {
  const tokens = content.split(os.EOL);
  const restTokens = tokens
    .filter(token => !MD_TITLE_REG.test(token))
    .filter(token => MD_HEADING_REG.test(token));
  return restTokens.join(os.EOL);
};

export const getNoteToc = (content: string) => {
  const tree = fromMarkdown(content) as Root;
  const result = toc(tree);
  const map = result.map;

  if (!map) {
    return [];
  }

  return map.children;
};

export const base64Encode = (text: string) => {
  return Buffer.from(text).toString('base64');
};

export const base64Decode = (text: string) => {
  return Buffer.from(text, 'base64').toString();
};

export const getNoteGraphFromNotes = async (
  notes: Note[],
): Promise<NoteGraph> => {
  const noteGraphLinks: Set<string> = new Set();
  const ids = notes.map(p => p.id);

  for (const note of notes) {
    const { forwardLinks, backlinks, id } = note;
    for (const fl of forwardLinks) {
      if (ids.includes(fl)) {
        noteGraphLinks.add(
          JSON.stringify({
            source: id,
            target: fl,
          }),
        );
      }
    }

    // for (const bl of backlinks) {
    //   if (ids.includes(bl)) {
    //     noteGraphLinks.add(
    //       JSON.stringify({
    //         source: bl,
    //         target: id,
    //       }),
    //     );
    //   }
    // }
  }

  return {
    nodes: notes.map(note => ({
      ...note,
      content: '',
      frontmatter: undefined,
    })),
    links: Array.from(noteGraphLinks).map(str => JSON.parse(str)),
  };
};

// convert frontmatter to metadata, see: https://github.com/remarkjs/remark-frontmatter?tab=readme-ov-file#example-frontmatter-as-metadata
function frontYamlMatterHandler() {
  return function (tree: any, file: any) {
    matter(file, { strip: true });
  };
}

const DEFAULT_MD_PROCESSOR = remark()
  .use(remarkFrontmatter)
  .use(frontYamlMatterHandler);

export const parseFrontMatter = (mdVFile: VFile) => {
  return DEFAULT_MD_PROCESSOR.process(mdVFile);
};

/**
 * Parse plain note with following steps:
 *  1. Parse frontmatter and remove it to custom frontmatter
 *  2. extract note title
 *  3. extract note content
 *  4. generate table of content(TOC)
 *
 * @param note markdown
 * @param filename markdown file name
 */
export const parseNote = (
  note: string,
  filename: string,
): { title: string; frontmatter: { [key: string]: any } | undefined } => {
  let title: string = '';

  // try to get title from frontmatter
  const frontmatter: { [key: string]: any } | undefined = {};
  try {
    // const vFile = DEFAULT_MD_PROCESSOR.processSync(note);
    // frontmatter = vFile.data.matter as undefined | { [key: string]: any };
    // title = frontmatter?.title;
  } catch (e) {
    // do nothing
  }

  // try to get title from heading `#`
  // if (!title) {
  //   const root = DEFAULT_MD_PROCESSOR.parse(note);
  //   const titleHeadingIdx = root.children.findIndex(
  //     node => node.type === 'heading' && node.depth === 1,
  //   );
  //   if (titleHeadingIdx !== -1) {
  //     const titleHeadingNode = root.children[titleHeadingIdx] as Heading;
  //     const textNode = titleHeadingNode.children.find(
  //       child => child.type === 'text',
  //     ) as Text;
  //     title = textNode.value;
  //   }
  // }

  // use file name as title
  if (!title) {
    title = filename.replace(MD_EXT_REG, '');
  }

  return { title, frontmatter };
};
