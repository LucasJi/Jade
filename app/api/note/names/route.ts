import { createRedisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

const redis = await createRedisClient();

/**
 * Get objects names from redis
 * tags: 'api:note/names'
 */
export async function GET() {
  const names = await redis.get('jade:obj:names');
  return NextResponse.json(names ? JSON.parse(names) : []);
}
