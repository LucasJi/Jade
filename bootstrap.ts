import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import fs from 'fs';
import path from 'path';
import { RedisSearchLanguages, SchemaFieldTypes } from 'redis';

const log = logger.child({ module: 'bootstrap' });
const redis = await createRedisClient();
// const buildGraphDataset = async (
//   paths: string[],
//   noteParserResults: Map<string, NoteParserResult>,
// ) => {
//   const mdFilePaths = paths.filter(p => getExt(p) === 'md');
//   // const pathColorMap = mapPathsToColors(paths);
//
//   const referenceCount = new Map<string, number>();
//   for (const path of mdFilePaths) {
//     const noteParserResult = noteParserResults.get(path);
//
//     if (!noteParserResult) {
//       continue;
//     }
//
//     const { internalLinkTargets } = noteParserResult;
//
//     for (const target of internalLinkTargets) {
//       const notePath = mapInternalLinkToPath(target, path, paths).notePath;
//       if (referenceCount.has(notePath)) {
//         referenceCount.set(notePath, referenceCount.get(notePath)! + 1);
//       } else {
//         referenceCount.set(notePath, 1);
//       }
//     }
//   }
//
//   const counts = Array.from(referenceCount.values());
//   const maxCount = max(counts) ?? 1;
//   const minCount = min(counts) ?? 0;
//
//   for (const path of mdFilePaths) {
//     const noteParserResult = noteParserResults.get(path);
//
//     if (!noteParserResult) {
//       continue;
//     }
//
//     const { frontmatter, internalLinkTargets } = noteParserResult;
//
//     const targetPaths = internalLinkTargets.map(
//       target => mapInternalLinkToPath(target, path, paths).notePath,
//     );
//
//     await redis.hSet(
//       RK.GRAPH,
//       path,
//       JSON.stringify({
//         key: path,
//         label: getSimpleFilename(path),
//         tags: frontmatter.tags,
//         // TODO: allow other file types
//         targets: filter(uniq(targetPaths), o => o !== '' && getExt(o) === 'md'),
//         // color: pathColorMap[path],
//         color: 'rgb(63, 63, 70)',
//         score:
//           (referenceCount.get(path) ?? 0 - minCount) / (maxCount - minCount),
//         x: Math.random(),
//         y: Math.random(),
//       }),
//     );
//   }
// };

const createSearchIndexes = async () => {
  log.info('Creating search indexes');
  const indexes = await redis.ft._list();
  log.info(`Exists search indexes: ${indexes}`);
  if (!indexes.includes(RK.IDX_HAST_CHILD)) {
    log.info(`Create search index: ${RK.IDX_HAST_CHILD}`);
    await redis.ft.create(
      RK.IDX_HAST_CHILD,
      {
        '$..value': {
          type: SchemaFieldTypes.TEXT,
          SORTABLE: true,
          AS: 'value',
        },
      },
      {
        ON: 'JSON',
        PREFIX: RK.HAST_CHILD,
        LANGUAGE: RedisSearchLanguages.CHINESE,
      },
    );
  } else {
    log.info(`Search index ${RK.IDX_HAST_CHILD} already exists`);
  }

  if (!indexes.includes(RK.IDX_FRONT_MATTER)) {
    log.info(`Create search index: ${RK.IDX_FRONT_MATTER}`);
    await redis.ft.create(
      RK.IDX_FRONT_MATTER,
      {
        '$.tags.*': {
          type: SchemaFieldTypes.TAG,
          AS: 'tag',
        },
      },
      {
        ON: 'JSON',
        PREFIX: RK.FRONT_MATTER,
        LANGUAGE: RedisSearchLanguages.CHINESE,
      },
    );
  } else {
    log.info(`Search index ${RK.IDX_FRONT_MATTER} already exists`);
  }
};

const createAssetsFolder = () => {
  log.info('Creating assets folder...');
  const folder = path.join(process.cwd(), 'jade-assets');
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
    log.info(`Assets folder ${folder} is created`);
  } else {
    log.info(`Assets folder ${folder} already exists`);
  }
};

const init = async () => {
  log.info('Initializing Jade...');

  await createSearchIndexes();
  createAssetsFolder();

  log.info('Jade initialization completed');
};

try {
  await init();
} catch (e) {
  log.error(e);
  throw e;
}
