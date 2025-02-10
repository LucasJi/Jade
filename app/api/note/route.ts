import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

const log = logger.child({ module: 'api', url: '/api/note', method: 'GET' });

const redis = await createRedisClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return new Response('', {
      status: 403,
      statusText: 'Note path is required',
    });
  }

  const paths = await redis.sMembers(RK.PATHS);

  if (!paths) {
    return new Response('', {
      status: 500,
      statusText: `Cache ${RK.PATHS} not exists`,
    });
  }

  const found = paths.find(e => e.includes(path));

  if (!found) {
    return new Response('', {
      status: 404,
      statusText: `Note with name ${path} is not found`,
    });
  }

  const note = await redis.json.get(`${RK.HAST}${path}`);
  log.info('Get hast from redis');

  return NextResponse.json(note);
}
