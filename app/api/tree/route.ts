import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';

const log = logger.child({ module: 'api', url: '/api/tree', method: 'GET' });

const redis = await createRedisClient();

export async function GET() {
  const treeView = await redis.json.get(RK.TREE_VIEW);
  return Response.json(treeView);
}
