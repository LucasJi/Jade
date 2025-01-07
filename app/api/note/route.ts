import { getNotePaths } from '@/app/api';
import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

const log = logger.child({ module: 'api', url: '/api/note', method: 'GET' });

const redis = await createRedisClient();

export async function GET(req: NextRequest) {
  log.info('Api /api/note called');
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get('name');

  if (!name) {
    return new Response('', {
      status: 403,
      statusText: 'Note name is required',
    });
  }

  const noteNames = await getNotePaths();

  const found = noteNames.find(e => e.includes(name));

  if (!found) {
    return new Response('', {
      status: 404,
      statusText: `Note with name ${name} is not found`,
    });
  }

  const note = await redis.json.get(`${RK.HAST}${name}`);
  log.info('Get hast from redis');

  return NextResponse.json(note);
}
