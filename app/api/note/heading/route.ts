import { RK } from '@/lib/constants';
import { createRedisClient } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = await createRedisClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let path = searchParams.get('path');

  if (!path) {
    // Get headings from home page
    const home = await redis.get(RK.HOME);

    if (home === null) {
      return NextResponse.json([]);
    }

    path = home;
  }

  const heading = await redis.get(`${RK.HEADING}${path}`);

  if (!heading) {
    return NextResponse.json([]);
  }

  return NextResponse.json(JSON.parse(heading));
}
