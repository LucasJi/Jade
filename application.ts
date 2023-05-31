export type RedisConfig = {
  host: string;
  password: string | undefined;
  port: number;
};

const redisPort = process.env.REDIS_PORT || '6379';

const redis: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  password: process.env.REDIS_PASSWORD,
  port: parseInt(redisPort, 10),
};

export { redis };
