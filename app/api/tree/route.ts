import { RK } from '@/lib/constants';
import { createRedisClient } from '@/lib/redis';

const redis = await createRedisClient();

export async function GET() {
  const treeView = await redis.json.get(RK.TREE_VIEW);
  return Response.json(treeView);
}
