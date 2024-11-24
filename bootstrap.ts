// /* eslint-disable no-console */
import config from '@/lib/config';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { getS3Client, listNoteObjects } from '@/lib/server/s3';

const log = logger.child({ module: 'bootstrap' });
const { dir, s3 } = config;
const s3Client = getS3Client();
const redis = await createRedisClient();
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

  log.info({ keySize: keys.length }, 'Clear all redis keys');
};

const cacheObjectNames = async () => {
  const noteObjects = await listNoteObjects(s3Client);
  const names = noteObjects.map(no => no.name);
  await redis.set('jade:obj:names', JSON.stringify(names));
  log.info({ objectSize: names.length }, 'Cache all object names');
};

const init = async () => {
  log.info('Initializing Jade...');

  await clearCache();
  await cacheObjectNames();
};

await init();
