import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { ASSETS_FOLDER } from '@/lib/server/server-constants';
import { mkdir, rm } from 'fs/promises';
import { RedisSearchLanguages, SchemaFieldTypes } from 'redis';

let redis: Awaited<ReturnType<typeof createRedisClient>> | null = null;

const log = logger.child({ module: 'api', path: '/sync/flush' });

export async function GET() {
  const luaScript = `
            local cursor = "0"
            repeat
                -- 执行 SCAN 获取部分 keys
                local result = redis.call("SCAN", cursor, "MATCH", ARGV[1], "COUNT", 1000)
                cursor = result[1]  -- 更新游标
                local keys = result[2]  -- 获取当前批次的 keys

                -- 批量删除 keys
                if #keys > 0 then
                    redis.call("DEL", unpack(keys))
                end
            until cursor == "0"  -- 游标为 "0" 时，表示扫描结束
            return "Deleted all matching keys"
        `;
  if (!redis) {
    redis = await createRedisClient();
  }
  const deleted = await redis.eval(luaScript, { arguments: ['jade:*'] });
  log.info(deleted);

  await redis.ft.dropIndex(RK.IDX_HAST_CHILD);
  await redis.ft.dropIndex(RK.IDX_FRONT_MATTER);

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
