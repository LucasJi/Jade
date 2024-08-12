import { Redis } from 'ioredis';

export const getRedisClient = () => {
  console.log('get redis client');
  return new Redis();
};
