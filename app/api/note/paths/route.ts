import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

const log = logger.child({
  module: 'api',
  url: '/api/note/paths',
  method: 'GET',
});

let redis: Awaited<ReturnType<typeof createRedisClient>> | null = null;

export async function GET() {
  if (!redis) {
    redis = await createRedisClient();
  }

  const paths = await redis.sMembers(RK.PATHS);
  return NextResponse.json(paths);
}
