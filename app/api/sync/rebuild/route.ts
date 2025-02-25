import { logger } from '@/lib/logger';
import { createRedisClient, RedisClient } from '@/lib/redis';
import { buildNoteCaches, buildTreeView } from '@/lib/server/server-notes';
import { NextRequest } from 'next/server';

const log = logger.child({
  module: 'api',
  route: '/api/sync/rebuild',
});

interface Body {
  files: {
    path: string;
    md5: string;
    extension: string;
    lastModified: string;
    isDeleted?: boolean;
  }[];
}

let redis: RedisClient | null = null;

export async function POST(req: NextRequest) {
  const body: Body = await req.json();
  const { files } = body;

  log.info('Rebuild begins');

  if (!redis) {
    redis = await createRedisClient();
  }

  if (files && files.length > 0) {
    await buildNoteCaches(redis, files);
  }

  log.info('Build tree view');
  await buildTreeView(redis);

  return Response.json({
    msg: 'Rebuild completed',
  });
}
