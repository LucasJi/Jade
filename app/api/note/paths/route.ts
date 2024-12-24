import { createRedisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

const redis = await createRedisClient();

/**
 * Get objects paths from redis
 */
export async function GET() {
  const paths = await redis.sMembers('jade:obj:paths');
  return NextResponse.json(paths);
}
