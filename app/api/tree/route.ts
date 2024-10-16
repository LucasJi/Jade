import { RK_TREE } from '@/lib/constants';
import { getRedisClient } from '@/lib/redis';

const redis = getRedisClient();

export async function GET() {
  const str = await redis.get(RK_TREE);
  const tree = JSON.parse(str || '[]');
  return Response.json(tree);
}
