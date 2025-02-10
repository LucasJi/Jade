import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import fs from 'fs';
import path from 'path';
import { RedisSearchLanguages, SchemaFieldTypes } from 'redis';

const log = logger.child({ module: 'bootstrap' });
const redis = await createRedisClient();

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
