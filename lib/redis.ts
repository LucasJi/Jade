import { logger } from '@/lib/logger';
import { createClient } from 'redis';

const log = logger.child({ module: 'lib:redis' });

export const createRedisClient = async () => {
  const host = process.env.REDIS_HOST;
  const port = Number.parseInt(process.env.REDIS_PORT || '') || 6379;
  const pass = process.env.REDIS_PASS;
  return await createClient({
    socket: {
      host,
      port,
    },
    password: pass,
  })
    .on('error', err =>
      log.error({ host, port }, `Failed to create redis client: ${err}`),
    )
    .on('ready', () => log.debug('Create redis client successfully'))
    .connect();
};
