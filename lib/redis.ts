import { logger } from '@/lib/logger';
import { Redis, RedisOptions } from 'ioredis';
import config from './config';

const log = logger.child({ module: 'lib:redis' });

export const getRedisClient = () => {
  const redisOptions: RedisOptions = {
    host: config.redis.host,
    port: config.redis.port,
  };

  if (config.redis.pass) {
    redisOptions.password = config.redis.pass;
  }

  log.info('Create a redis client');

  return new Redis(redisOptions);
};
