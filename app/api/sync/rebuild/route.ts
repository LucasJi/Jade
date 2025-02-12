import { logger } from '@/lib/logger';
import { buildNoteCaches, buildTreeView } from '@/lib/server/server-notes';
import { NextRequest, NextResponse } from 'next/server';

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
  }[];
}

export async function POST(req: NextRequest) {
  const body: Body = await req.json();
  const { files } = body;

  if (!files || files.length === 0) {
    return NextResponse.json({ msg: 'No files changed' });
  }

  log.info('Rebuild begins');
  buildNoteCaches(files);

  log.info('Build tree view');
  await buildTreeView();

  return Response.json({
    msg: 'Rebuild completed',
  });
}
