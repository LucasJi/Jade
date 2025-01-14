import { RK } from '@/lib/constants';
import {
  getExt,
  getFilename,
  getSimpleFilename,
  mapInternalLinkToPath,
  mapPathsToColors,
} from '@/lib/file';
import { logger } from '@/lib/logger';
import { listExistedObjs } from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { S3 } from '@/lib/server/s3';
import { noteParser } from '@/processor/parser';
import { NoteParserResult } from '@/processor/types';
import { filter, max, min, uniq } from 'lodash';
import { RedisSearchLanguages, SchemaFieldTypes } from 'redis';

const log = logger.child({ module: 'bootstrap' });
const redis = await createRedisClient();
const s3 = new S3();

const clearCache = async () => {
  const keys = await redis.keys(RK.ALL);
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
  const objects = listExistedObjs(await s3.listObjects());
  const paths = objects.map(obj => obj.path);

  await redis.sAdd(RK.PATHS, paths);

  for (const obj of objects) {
    await redis.hSet(RK.OBJS, obj.path, JSON.stringify(obj));
  }

  log.info({ objectSize: paths.length }, 'Cache all object');
  return paths;
};

const cacheNotes = async (paths: string[]) => {
  const noteParserResults = new Map<string, NoteParserResult>();

  for (const path of paths) {
    const ext = getExt(path);

    if (ext !== 'md') {
      continue;
    }

    const note = await s3.getObject(path);
    const noteParserResult = noteParser({
      note,
      plainNoteName: getFilename(path),
    });
    const { hast, headings, frontmatter } = noteParserResult;
    noteParserResults.set(path, noteParserResult);

    await redis.json.set(`${RK.HAST}${path}`, '$', hast as any);
    await redis.set(`${RK.HEADING}${path}`, JSON.stringify(headings));
    await redis.json.set(`${RK.FRONT_MATTER}${path}`, '$', frontmatter);

    if (hast.children && hast.children.length > 0) {
      for (let i = 0; i < hast.children.length; i++) {
        await redis.json.set(
          `${RK.HAST_CHILD}${path}:${i}`,
          '$',
          hast.children[i] as any,
        );
      }
    }
    log.info(`Cache hast of ${path}`);
  }

  return noteParserResults;
};

const buildGraphDataset = async (
  paths: string[],
  noteParserResults: Map<string, NoteParserResult>,
) => {
  const mdFilePaths = paths.filter(p => getExt(p) === 'md');
  const MIN_SIZE = 4;
  const MAX_SIZE = 20;
  const pathColorMap = mapPathsToColors(paths);
  const referenceCount: Record<string, number> = {};

  for (const path of mdFilePaths) {
    const noteParserResult = noteParserResults.get(path);

    if (!noteParserResult) {
      continue;
    }

    const { internalLinkTargets } = noteParserResult;

    for (const target of internalLinkTargets) {
      const notePath = mapInternalLinkToPath(target, path, paths).notePath;
      if (notePath in referenceCount) {
        referenceCount[notePath] = referenceCount[notePath] + 1;
      } else {
        referenceCount[notePath] = 1;
      }
    }
  }

  for (const path of mdFilePaths) {
    const noteParserResult = noteParserResults.get(path);

    if (!noteParserResult) {
      continue;
    }

    const { frontmatter, internalLinkTargets } = noteParserResult;

    const targetPaths = internalLinkTargets.map(
      target => mapInternalLinkToPath(target, path, paths).notePath,
    );

    let size = min([MAX_SIZE, max([MIN_SIZE, referenceCount[path] * 1.5])]);
    if (size === undefined) {
      size = MIN_SIZE;
    }

    await redis.hSet(
      RK.GRAPH,
      path,
      JSON.stringify({
        key: path,
        label: getSimpleFilename(path),
        tags: frontmatter.tags,
        // TODO: allow other file types
        targets: filter(uniq(targetPaths), o => o !== '' && getExt(o) === 'md'),
        color: pathColorMap[path],
        size: size,
        x: Math.random(),
        y: Math.random(),
      }),
    );
  }
};

const createSearchIndexes = async () => {
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
};

const init = async () => {
  log.info('Initializing Jade...');

  await clearCache();
  const paths = await cacheObjects();
  const noteParserResults = await cacheNotes(paths);
  await buildGraphDataset(paths, noteParserResults);
  await createSearchIndexes();
};

try {
  await init();
} catch (e) {
  log.error(e);
}
