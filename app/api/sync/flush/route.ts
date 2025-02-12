import { RK } from '@/lib/constants';
import { createRedisClient } from '@/lib/redis';
import { ASSETS_FOLDER } from '@/lib/server/server-constants';
import { mkdir, rm } from 'fs/promises';
import { RedisSearchLanguages, SchemaFieldTypes } from 'redis';

const redis = await createRedisClient();

export async function GET() {
  await redis.flushDb();
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

  try {
    await rm(ASSETS_FOLDER, { recursive: true, force: true });
    await mkdir(ASSETS_FOLDER);
    console.log(`Folder cleared: ${ASSETS_FOLDER}`);
  } catch (err) {
    console.error(`Failed to clear folder: ${err}`);
  }

  return Response.json({
    data: true,
    msg: 'Flush completed',
  });
}
