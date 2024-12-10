import { createRedisClient } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = await createRedisClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const content = searchParams.get('content') || '';
  const result = await redis.ft.search('jade:idx:hChld', content);
  return NextResponse.json(result);
}
