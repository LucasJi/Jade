import { logger } from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

const log = logger.child({
  module: 'api',
  route: 'api/revalidate',
});

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');

  if (path) {
    log.info({ path }, 'Revalidate path success');
    revalidatePath(path, 'page');
    return Response.json({ revalidated: true, now: Date.now() });
  }

  log.warn({ path }, 'Revalidate path missing');
  return Response.json({
    revalidated: false,
    now: Date.now(),
  });
}
