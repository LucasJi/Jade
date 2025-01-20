import { getHome } from '@/app/api';
import { RK } from '@/lib/constants';
import { createRedisClient } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

const redis = await createRedisClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let path = searchParams.get('path');

  if (!path) {
    // Try to get headings from home page
    const homeDetails = await getHome();

    if (homeDetails === null) {
      return NextResponse.json([]);
    }

    const { origin } = homeDetails;
    path = origin;
  }

  const heading = await redis.get(`${RK.HEADING}${path}`);

  if (!heading) {
    return NextResponse.json([]);
  }

  return NextResponse.json(JSON.parse(heading));
}
