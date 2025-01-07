import { RK } from '@/lib/constants';
import { createRedisClient } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = await createRedisClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json([]);
  }

  const heading = await redis.get(`${RK.HEADING}${path}`);

  if (!heading) {
    return NextResponse.json([]);
  }

  return NextResponse.json(JSON.parse(heading));
}
