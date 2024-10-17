/* eslint-disable no-console */
import { RK_ID_NOTE, RK_ID_PATH, RK_TREE, SEP } from '@/lib/constants';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { getRedisClient } from '@/lib/redis';
import { getObject, getS3Client, listLatestExistingObjects } from '@/lib/s3';
import { base64Decode, buildNoteTree, parseNote } from '@/lib/server-utils';
import { getFileExt } from '@/lib/utils';
import {
  fromWikilinkMarkdown,
  remarkWikilinkSyntax,
} from '@/plugins/remark-wikilink';
import { Note, NoteObject } from '@types';
import fs from 'fs';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { join } from 'path';
import { Node, visit } from 'unist-util-visit';

const log = logger.child({ module: 'bootstrap' });
const { dir, s3 } = env;
const s3Client = getS3Client(s3.clientOptions);
const redis = getRedisClient();

const listNoteObjectsRemotely = async (
  excluded: string[],
): Promise<NoteObject[]> => {
  return listLatestExistingObjects(s3Client, s3.bucket).then(objs =>
    objs
      .filter(obj => !excluded.includes(obj.name.split('/')[0]))
      .map(obj => ({
        name: obj.name,
        ext: getFileExt(obj.name),
        type: 'file',
      })),
  );
};

// TODO: Refactor
// const loadLocalVaultFilePathItems = (
//   dir: string,
//   root: string,
//   excludedPaths: string[],
//   pathItems: NoteObj[] = [],
// ): NoteObj[] => {
//   const files = fs.readdirSync(dir);
//
//   for (const file of files) {
//     const absolutePath = join(dir, file);
//     if (fs.statSync(absolutePath).isDirectory()) {
//       if (excludedPaths.includes(file)) {
//         continue;
//       }
//       loadLocalVaultFilePathItems(absolutePath, root, excludedPaths, pathItems);
//     } else {
//       const ext = getFileExt(file);
//       if (ACCEPTED_FILE_FORMATS.includes(ext)) {
//         const relativePath = absolutePath.replace(root + SEP, '');
//         pathItems.push({
//           id: relativePath,
//           name: relativePath,
//           type: 'file',
//           ext,
//         });
//       }
//     }
//   }
//
//   return pathItems;
// };

const listNoteObjects = async (): Promise<NoteObject[]> => {
  // if (dir.root) {
  //   log.info(
  //     `Load vault from local dir: ${dir.root}. Those folders will be ignored: ${dir.excluded}`,
  //   );
  //   return loadLocalVaultFilePathItems(dir.root, dir.root, dir.excluded);
  // }

  return listNoteObjectsRemotely(dir.excluded).then(objs => {
    log.info(
      {
        noteObjSize: objs.length,
        from: 'remote',
        excludedDirs: dir.excluded,
        bucket: s3.bucket,
      },
      'List note objects',
    );
    return objs;
  });
};

const loadNote = async (name: string, id: string): Promise<Note> => {
  try {
    let file;
    if (dir.root) {
      file = fs.readFileSync(join(dir.root, name), 'utf8');
    } else {
      // file = await githubRequest(`/contents/${path}`, `note:${id}`);
      file = await getObject(s3Client, s3.bucket, name);
    }
    // Github: use base64Decode to resolve emoji base64 decoding problem
    // const content = dir.root ? file : base64Decode(file.content);

    const content = file;

    const filenameSplits = name.split(SEP);
    const filename = filenameSplits[filenameSplits.length - 1];
    const { title, frontmatter } = parseNote(content, filename);

    return {
      id,
      content: content,
      title,
      frontmatter,
      forwardLinks: [],
      backlinks: [],
      path: name,
    };
  } catch (e) {
    console.error('load note failed with path:', name, e);
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

const clearCache = async () => {
  const keys = await redis.keys('jade:*');
  keys.forEach(key => {
    redis.del(key);
  });

  log.info({ keySize: keys.length }, 'Clear cache');
};

const loadVault = async () => {
  await clearCache();

  const existIds = new Set<string>();
  const notes: Note[] = [];

  const noteObjects = await listNoteObjects();

  for (const noteObject of noteObjects) {
    const { name, ext } = noteObject;

    redis.set(`${RK_ID_PATH}${name}`, JSON.stringify(noteObject));

    const note = await loadNote(name, '');
    notes.push(note);
  }

  await resolveWikilinks(notes);

  // cache notes
  for (const note of notes) {
    const key = `${RK_ID_NOTE}${note.id}`;
    redis.set(key, JSON.stringify(note));
  }

  const noteTree = buildNoteTree(noteObjects);

  // cache notes tree
  redis.set(RK_TREE, JSON.stringify(noteTree));
};

const init = async () => {
  await loadVault();
};

log.info('Jade is initializing...');
await init();
log.info('Jade initialization ends');
