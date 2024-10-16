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

  console.log('Create a redis client at', new Date());

  return new Redis(redisOptions);
};
