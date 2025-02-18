import { logger } from '@/lib/logger';
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

export async function POST(req: NextRequest) {
  const body: Body = await req.json();
  const { files } = body;

  log.info('Rebuild begins');

  if (files && files.length > 0) {
    await buildNoteCaches(files);
  }

  log.info('Build tree view');
  await buildTreeView();

  return Response.json({
    msg: 'Rebuild completed',
  });
}
