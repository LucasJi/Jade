import { createRedisClient } from '@/lib/redis';

const redis = await createRedisClient();

export async function GET() {
  await redis.flushDb();

  return Response.json({
    data: true,
    msg: 'Ok',
  });
}
