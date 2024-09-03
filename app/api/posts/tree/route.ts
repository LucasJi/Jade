import { POSTS_TREE } from '@/lib/constants';
import { getRedisClient } from '@/lib/redis-utils';

const redis = getRedisClient();

export async function GET() {
  const str = await redis.get(POSTS_TREE);
  const postsTree = JSON.parse(str || '[]');
  return Response.json(postsTree);
}
