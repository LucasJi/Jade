import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { ASSETS_FOLDER } from '@/lib/server/server-constants';
import { mkdir, rm } from 'fs/promises';
import { RedisSearchLanguages, SchemaFieldTypes } from 'redis';

const redis = await createRedisClient();
const log = logger.child({ module: 'api', path: '/sync/flush' });

export async function GET() {
  const luaScript = `
            local keys = redis.call('SCAN', 0, 'MATCH', ARGV[1], 'COUNT', 1000)
            for _, key in ipairs(keys[2]) do
                redis.call('DEL', key)
            end
            return #keys[2]
        `;
  const deleted = await redis.eval(luaScript, { arguments: ['jade:*'] });
  log.info(`Deleted ${deleted} keys using Lua script`);

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
