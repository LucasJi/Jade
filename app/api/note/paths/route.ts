import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

const redis = await createRedisClient();
const log = logger.child({
  module: 'api',
  url: '/api/note/paths',
  method: 'GET',
});

/**
 * Get objects paths from redis
 */
export async function GET() {
  log.debug('Api /api/note/paths called');
  const paths = await redis.sMembers(RK.PATHS);
  return NextResponse.json(paths);
}
