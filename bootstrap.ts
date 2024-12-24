import { getExt, getFilename } from '@/lib/file';
import { logger } from '@/lib/logger';
import { listExistedNotes } from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { S3 } from '@/lib/server/s3';
import { parseNote } from '@/processor/parser';
import { RedisSearchLanguages, SchemaFieldTypes } from 'redis';

const log = logger.child({ module: 'bootstrap' });
const redis = await createRedisClient();
const s3 = new S3();
//
// // TODO: Refactor
// // const loadLocalVaultFilePathItems = (
// //   dir: string,
// //   root: string,
// //   excludedPaths: string[],
// //   pathItems: NoteObj[] = [],
// // ): NoteObj[] => {
// //   const files = fs.readdirSync(dir);
// //
// //   for (const file of files) {
// //     const absolutePath = join(dir, file);
// //     if (fs.statSync(absolutePath).isDirectory()) {
// //       if (excludedPaths.includes(file)) {
// //         continue;
// //       }
// //       loadLocalVaultFilePathItems(absolutePath, root, excludedPaths, pathItems);
// //     } else {
// //       const ext = getFileExt(file);
// //       if (ACCEPTED_FILE_FORMATS.includes(ext)) {
// //         const relativePath = absolutePath.replace(root + SEP, '');
// //         pathItems.push({
// //           id: relativePath,
// //           name: relativePath,
// //           type: 'file',
// //           ext,
// //         });
// //       }
// //     }
// //   }
// //
// //   return pathItems;
// // };
//
// // const loadNote = async (name: string, id: string): Promise<Note> => {
// //   try {
// //     let file;
// //     if (dir.root) {
// //       file = fs.readFileSync(join(dir.root, name), 'utf8');
// //     } else {
// // file = await githubRequest(`/contents/${path}`, `note:${id}`);
// // file = await getObject(s3Client)(s3.bucket, name);
// // }
// // Github: use base64Decode to resolve emoji base64 decoding problem
// // const content = dir.root ? file : base64Decode(file.content);
//
// //     const content = file;
// //
// //     const filenameSplits = name.split(SEP);
// //     const filename = filenameSplits[filenameSplits.length - 1];
// //     const { title, frontmatter } = parseNote(content, filename);
// //
// //     return {
// //       id,
// //       content: content,
// //       title,
// //       frontmatter,
// //       forwardLinks: [],
// //       backlinks: [],
// //       path: name,
// //     };
// //   } catch (e) {
// //     console.error('load note failed with path:', name, e);
// //     throw e;
// //   }
// // };
//
// const resolveWikilinks = async (notes: Note[]) => {
//   const findNoteById = (id: string): Note | undefined => {
//     return notes.find(p => p.id === id);
//   };
//
//   for (const note of notes) {
//     if (note !== null) {
//       const tree = fromMarkdown(note.content, {
//         extensions: [remarkWikilinkSyntax()],
//         mdastExtensions: [fromWikilinkMarkdown()],
//       });
//
//       const forwardLinks: Set<string> = new Set();
//
//       visit(tree as Node, 'wikilink', node => {
//         const { value }: { value: string } = node;
//         const note = notes.find(note => {
//           const path = base64Decode(note.id);
//           return path.includes(value.split('#')[0]);
//         });
//         if (note) {
//           forwardLinks.add(note.id);
//         }
//       });
//
//       note.forwardLinks = Array.from(forwardLinks);
//
//       for (const fl of forwardLinks) {
//         const fp = findNoteById(fl);
//         if (fp) {
//           const bls = new Set(fp.backlinks);
//           bls.add(note.id);
//           fp.backlinks = Array.from(bls);
//         }
//       }
//     }
//   }
// };
//
const clearCache = async () => {
  const keys = await redis.keys('jade:*');
  keys.forEach(key => {
    redis.del(key);
  });

  const ftIdxes = await redis.ft._list();
  for (const idx of ftIdxes) {
    log.info(`Clear ft idx: ${idx}`);
    await redis.ft.dropIndex(idx);
  }
  log.info({ keySize: keys.length }, 'Clear all redis keys');
};

const cacheObjects = async () => {
  const objects = listExistedNotes(await s3.listObjects());
  const names = objects.map(obj => obj.name);
  await redis.set('jade:obj:names', JSON.stringify(names));
  await redis.set('jade:objs', JSON.stringify(objects));
  log.info({ objectSize: names.length }, 'Cache all object');
  return names;
};

const cacheNotes = async (names: string[]) => {
  for (const name of names) {
    const ext = getExt(name);

    if (ext !== 'md') {
      continue;
    }

    const note = await s3.getObject(name);
    const { hast, headings, frontmatter } = parseNote({
      note,
      plainNoteName: getFilename(name),
    });

    await redis.json.set(`jade:hast:${name}`, '$', hast as any);
    await redis.set(`jade:headings:${name}`, JSON.stringify(headings));
    await redis.json.set(`jade:frontmatter:${name}`, '$', frontmatter);

    if (hast.children && hast.children.length > 0) {
      for (let i = 0; i < hast.children.length; i++) {
        await redis.json.set(
          `jade:hChld:${name}:${i}`,
          '$',
          hast.children[i] as any,
        );
      }
    }
    log.info(`Cache hast of ${name}`);
  }
};

const createSearchIndexes = async () => {
  log.info('Create search index: jade:idx:hChld');
  await redis.ft.create(
    'jade:idx:hChld',
    {
      '$..value': {
        type: SchemaFieldTypes.TEXT,
        SORTABLE: true,
      },
    },
    {
      ON: 'JSON',
      PREFIX: 'jade:hChld:',
      LANGUAGE: RedisSearchLanguages.CHINESE,
    },
  );

  log.info('Create search index: jade:idx:frontmatter');
  await redis.ft.create(
    'jade:idx:frontmatter',
    {
      '$.tags.*': {
        type: SchemaFieldTypes.TAG,
        AS: 'tag',
      },
    },
    {
      ON: 'JSON',
      PREFIX: 'jade:frontmatter:',
      LANGUAGE: RedisSearchLanguages.CHINESE,
    },
  );
};

const init = async () => {
  log.info('Initializing Jade...');

  await clearCache();
  const names = await cacheObjects();
  await cacheNotes(names);
  await createSearchIndexes();
};

try {
  await init();
} catch (e) {
  log.error(e);
}
