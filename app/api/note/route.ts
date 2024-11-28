import { getNoteNames } from '@/app/api';
import { S3 } from '@/lib/server/s3';
import { NextRequest, NextResponse } from 'next/server';

const s3 = new S3();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get('name');

  if (!name) {
    return new Response('', {
      status: 403,
      statusText: 'Note name is required',
    });
  }

  const noteNames = await getNoteNames();

  const found = noteNames.find(e => e.includes(name));

  if (!found) {
    return new Response('', {
      status: 404,
      statusText: `Note with name ${name} is not found`,
    });
  }

  const note = await s3.getObject(found);

  return NextResponse.json(note);
}
