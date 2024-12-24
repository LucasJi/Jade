import { getExt, getFilename } from '@/lib/file';
import { logger } from '@/lib/logger';
import { listExistedObjs } from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { S3 } from '@/lib/server/s3';
import { parseNote } from '@/processor/parser';
import { RedisSearchLanguages, SchemaFieldTypes } from 'redis';

const log = logger.child({ module: 'bootstrap' });
const redis = await createRedisClient();
const s3 = new S3();

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
  const objects = listExistedObjs(await s3.listObjects());
  const names = objects.map(obj => obj.name);
  await redis.set('jade:obj:paths', JSON.stringify(names));
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
