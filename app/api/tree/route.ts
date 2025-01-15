import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { getNoteTreeView, listExistedObjs } from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { S3 } from '@/lib/server/s3';

const log = logger.child({ module: 'api', url: '/api/tree', method: 'GET' });

const s3 = new S3();
const redis = await createRedisClient();

export async function GET() {
  let noteObjects;
  const cache = await redis.hVals(RK.OBJS);
  if (cache === null) {
    noteObjects = listExistedObjs(await s3.listObjectVersions());
  } else {
    noteObjects = cache.map(c => JSON.parse(c));
  }
  const noteTreeView = getNoteTreeView(noteObjects);
  return Response.json(noteTreeView);
}
