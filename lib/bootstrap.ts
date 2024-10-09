/* eslint-disable no-console */
import {
  ACCEPTED_FILE_FORMATS,
  MD_EXT,
  RK_ID_NOTE,
  RK_ID_PATH,
  RK_IDS,
  RK_NOTE_PATH_ID,
  RK_TREE,
  SEP,
} from '@/lib/constants';
import { env } from '@/lib/env';
import { getGitTree, githubRequest } from '@/lib/github-utils';
import { getRedisClient } from '@/lib/redis-utils';
import {
  base64Decode,
  buildNoteTree,
  decimalToBase62,
  murmurhash,
  parseNote,
} from '@/lib/server-utils';
import {
  fromWikilinkMarkdown,
  remarkWikilinkSyntax,
} from '@/plugins/remark-wikilink';
import { Note, PathItem } from '@types';
import fs from 'fs';
import { fromMarkdown } from 'mdast-util-from-markdown';
import path, { join } from 'path';
import { Node, visit } from 'unist-util-visit';

const { dir } = env;

const loadRemoteVaultFilePathItems = (): Promise<PathItem[]> => getGitTree();

const loadLocalVaultFilePathItems = (
  dir: string,
  root: string,
  excludedPaths: string[],
  pathItems: PathItem[] = [],
): PathItem[] => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const absolutePath = join(dir, file);
    if (fs.statSync(absolutePath).isDirectory()) {
      if (excludedPaths.includes(file)) {
        continue;
      }
      loadLocalVaultFilePathItems(absolutePath, root, excludedPaths, pathItems);
    } else {
      const ext = path.extname(file);
      if (ACCEPTED_FILE_FORMATS.includes(ext)) {
        const relativePath = absolutePath.replace(root + SEP, '');
        pathItems.push({
          id: relativePath,
          path: relativePath,
          type: 'blob',
          ext,
        });
      }
    }
  }

  return pathItems;
};

const loadVaultFilePathItems = async () =>
  dir.root
    ? loadLocalVaultFilePathItems(dir.root, dir.root, dir.excluded)
    : loadRemoteVaultFilePathItems();

const loadNote = async (path: string, id: string): Promise<Note> => {
  try {
    let file;
    if (dir.root) {
      file = fs.readFileSync(join(dir.root, path), 'utf8');
    } else {
      file = await githubRequest(`/contents/${path}`, `note:${id}`);
    }
    // base64Decode: resolve emoji base64 decoding problem
    const content = dir.root ? file : base64Decode(file.content);
    const filenameSplits = path.split(SEP);
    const filename = filenameSplits[filenameSplits.length - 1];
    const { title, frontmatter } = parseNote(content, filename);

    return {
      id,
      content: content,
      title,
      frontmatter,
      forwardLinks: [],
      backlinks: [],
      path,
    };
  } catch (e) {
    console.error('load note failed with path:', path, e);
    throw e;
  }
};

const resolveWikilinks = async (notes: Note[]) => {
  const findNoteById = (id: string): Note | undefined => {
    return notes.find(p => p.id === id);
  };

  for (const note of notes) {
    if (note !== null) {
      const tree = fromMarkdown(note.content, {
        extensions: [remarkWikilinkSyntax()],
        mdastExtensions: [fromWikilinkMarkdown()],
      });

      const forwardLinks: Set<string> = new Set();

      visit(tree as Node, 'wikilink', node => {
        const { value }: { value: string } = node;
        const note = notes.find(note => {
          const path = base64Decode(note.id);
          return path.includes(value.split('#')[0]);
        });
        if (note) {
          forwardLinks.add(note.id);
        }
      });

      note.forwardLinks = Array.from(forwardLinks);

      for (const fl of forwardLinks) {
        const fp = findNoteById(fl);
        if (fp) {
          const bls = new Set(fp.backlinks);
          bls.add(note.id);
          fp.backlinks = Array.from(bls);
        }
      }
    }
  }
};

const loadVault = async () => {
  const redis = getRedisClient();
  const jadeKeys = await redis.keys('jade:*');
  jadeKeys.forEach(key => {
    redis.del(key);
  });
  const existIds = new Set<string>();
  const notes: Note[] = [];

  const pathItems = await loadVaultFilePathItems();

  for (const item of pathItems) {
    const { path, ext } = item;
    let hash = murmurhash(path);
    let id = decimalToBase62(hash);

    if (existIds.has(id)) {
      hash = murmurhash(item.path + 'DUPLICATED');
      id = decimalToBase62(hash);
    }
    existIds.add(id);

    item.id = id;

    // cache path
    redis.set(`${RK_NOTE_PATH_ID}${path}`, id);
    redis.set(`${RK_ID_PATH}${id}`, JSON.stringify(item));

    if (ext === MD_EXT) {
      const note = await loadNote(path, id);
      notes.push(note);
    }
  }

  // cache ids
  redis.sadd(RK_IDS, [...existIds.values()]);

  await resolveWikilinks(notes);

  // cache notes
  for (const note of notes) {
    const key = `${RK_ID_NOTE}${note.id}`;
    redis.set(key, JSON.stringify(note));
  }

  const noteTree = buildNoteTree(pathItems);

  // cache notes tree
  redis.set(RK_TREE, JSON.stringify(noteTree));
};

const init = async () => {
  console.log('initializing jade...');
  const begin = new Date().getTime();

  await loadVault();

  console.log('jade initialized in', new Date().getTime() - begin, 'ms');
};

await init();
