import { RK } from '@/lib/constants';
import { createRedisClient } from '@/lib/redis';

let redis: Awaited<ReturnType<typeof createRedisClient>> | null = null;

export async function GET() {
  if (!redis) {
    redis = await createRedisClient();
  }
  const treeView = await redis.json.get(RK.TREE_VIEW);
  return Response.json(treeView);
}
