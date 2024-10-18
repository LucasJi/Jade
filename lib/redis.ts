import { Redis, RedisOptions } from 'ioredis';
import { config } from './config';

export const getRedisClient = () => {
  const redisOptions: RedisOptions = {
    host: config.redis.host,
    port: config.redis.port,
  };

  if (config.redis.pass) {
    redisOptions.password = config.redis.pass;
  }

  console.log('Create a redis client at', new Date());

  return new Redis(redisOptions);
};
