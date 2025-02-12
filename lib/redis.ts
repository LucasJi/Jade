import { logger } from '@/lib/logger';
import { createClient } from 'redis';
import config from './config';

const log = logger.child({ module: 'lib:redis' });

export const createRedisClient = async () => {
  return await createClient({
    url: `redis://:${config.redis.pass}@${config.redis.host}:${config.redis.port}`,
  })
    .on('error', err => log.error({ error: err }, 'Redis Client Error'))
    .on('ready', () => {})
    .connect();
};
