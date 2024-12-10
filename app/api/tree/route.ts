import { logger } from '@/lib/logger';
import { getNoteTreeView, listExistedNotes } from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { S3 } from '@/lib/server/s3';

const log = logger.child({ module: 'api', url: '/api/tree', method: 'GET' });

const s3 = new S3();
const redis = await createRedisClient();

export async function GET() {
  let noteObjects;
  const cache = await redis.get('jade:objs');
  if (cache === null) {
    noteObjects = listExistedNotes(await s3.listObjects());
  } else {
    noteObjects = JSON.parse(cache);
  }
  const noteTreeView = getNoteTreeView(noteObjects);

  // log.debug({ response: noteTreeView }, 'Get tree view route handler called');

  return Response.json(noteTreeView);
}
