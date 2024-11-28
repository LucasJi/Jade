import { logger } from '@/lib/logger';
import { getNoteTreeView, listExistedNotes } from '@/lib/note';
import { S3 } from '@/lib/server/s3';

const log = logger.child({ module: 'api', url: '/api/tree', method: 'GET' });

const s3 = new S3();

export async function GET() {
  const noteObjects = listExistedNotes(await s3.listObjects());
  const noteTreeView = getNoteTreeView(noteObjects);

  // log.debug({ response: noteTreeView }, 'Get tree view route handler called');

  return Response.json(noteTreeView);
}
