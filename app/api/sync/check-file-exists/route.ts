import { RK } from '@/lib/constants';
import { createRedisClient } from '@/lib/redis';
import { NextRequest } from 'next/server';

const redis = await createRedisClient();

// TODO: deprecated
export async function GET(request: NextRequest) {
  const md5 = request.nextUrl.searchParams.get('md5');

  if (!md5) {
    return new Response('', {
      status: 403,
      statusText: 'Parameter md5 is required',
    });
  }

  const filesCache = await redis.hVals(RK.FILES);

  for (const cache of filesCache) {
    if (cache.includes(md5)) {
      return Response.json({
        data: {
          exists: true,
        },
        msg: 'File already exists',
      });
    }
  }

  return Response.json({
    data: {
      exists: false,
    },
    msg: 'File not exists',
  });
}
