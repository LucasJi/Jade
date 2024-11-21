import { getS3Client, listNoteObjects } from '@/lib/server/s3';
import { NextResponse } from 'next/server';

const s3Client = getS3Client();

export async function GET() {
  const noteObjects = await listNoteObjects(s3Client);
  const names = noteObjects.map(no => no.name);
  return NextResponse.json(names);
}
