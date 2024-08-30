import { Redis, RedisOptions } from 'ioredis';
import { env } from './env';

export const getRedisClient = () => {
  const redisOptions: RedisOptions = {
    host: env.redis.host,
    port: env.redis.port,
  };

  if (env.redis.pass) {
    redisOptions.password = env.redis.pass;
  }

  return new Redis(redisOptions);
};
