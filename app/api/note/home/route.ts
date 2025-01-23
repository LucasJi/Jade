import { getNotePaths } from '@/app/api';
import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

const log = logger.child({
  module: 'api',
  url: '/api/note/home',
  method: 'GET',
});

const redis = await createRedisClient();

export async function GET() {
  const paths = await getNotePaths();

  let homeNotePath = null;

  for (const path of paths) {
    let result = null;
    try {
      result = await redis.json.get(`${RK.FRONT_MATTER}${path}`, {
        path: ['.home'],
      });
    } catch (e) {
      // do nothing
    }
    if (result === true) {
      homeNotePath = path;
    }
  }

  if (homeNotePath) {
    const note = await redis.json.get(`${RK.HAST}${homeNotePath}`);
    return NextResponse.json({
      origin: homeNotePath,
      hast: note,
    });
  }

  return NextResponse.json(null);
}
