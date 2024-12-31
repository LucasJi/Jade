import { createRedisClient } from '@/lib/redis';
import { trim } from 'lodash';
import { NextRequest, NextResponse } from 'next/server';

const redis = await createRedisClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let content = searchParams.get('content') || '';
  content = trim(content)
    .split(' ')
    .map(c => `${c}*`)
    .join(' ');
  const result = await redis.ft.search('jade:idx:hChld', `${content}`);
  return NextResponse.json(result);
}
