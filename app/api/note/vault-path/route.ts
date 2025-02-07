import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { NextRequest, NextResponse } from 'next/server';

const log = logger.child({
  module: 'api',
  url: '/api/note/vault-path',
  method: 'GET',
});

const redis = await createRedisClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const routePath = searchParams.get('routePath');

  if (!routePath) {
    return new Response('', {
      status: 403,
      statusText: 'Note path is required',
    });
  }

  const vaultPath = await redis.get(`${RK.PATH_MAPPING}${routePath}`);

  log.info(
    {
      routePath,
      vaultPath,
    },
    'Get note vault path from route path',
  );

  return NextResponse.json({
    data: vaultPath || '',
  });
}
