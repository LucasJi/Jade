import { getNoteTreeView, listNoteObjects } from '@/lib/note';
import { getS3Client } from '@/lib/s3';

const s3Client = getS3Client();

export async function GET() {
  const noteObjects = await listNoteObjects(s3Client);
  const noteTreeView = getNoteTreeView(noteObjects);
  return Response.json(JSON.stringify(noteTreeView));
}
