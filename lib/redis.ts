import { logger } from '@/lib/logger';
import { createClient } from 'redis';

const log = logger.child({ module: 'lib:redis' });

export const createRedisClient = async () => {
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = Number.parseInt(process.env.REDIS_PORT || '') || 6379;
  const pass = process.env.REDIS_PASS;
  return await createClient({
    url: `redis://:${pass}@${host}:${port}`,
  })
    .on('error', err => log.error({ error: err }, 'Redis Client Error'))
    .on('ready', () => {})
    .connect();
};
