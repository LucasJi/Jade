import { logger } from '@/lib/logger';
import { getNoteTreeView } from '@/lib/note';
import { getS3Client, listNoteObjects } from '@/lib/server/s3';

const log = logger.child({ module: 'api', url: '/api/tree', method: 'GET' });

const s3Client = getS3Client();

export async function GET() {
  const noteObjects = await listNoteObjects(s3Client);
  const noteTreeView = getNoteTreeView(noteObjects);

  log.debug({ response: noteTreeView }, 'Get tree view route handler called');

  return Response.json(noteTreeView);
}
