import config from '@/lib/config';
import { getObject, getS3Client } from '@/lib/server/s3';
import { NextRequest, NextResponse } from 'next/server';

const s3Client = getS3Client();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get('name');

  if (!name) {
    return new Response('', {
      status: 403,
      statusText: 'Param name is required',
    });
  }

  const noteNames = (await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/note/names`,
    {
      cache: 'force-cache',
      next: {
        tags: ['api:note/names'],
      },
    },
  ).then(resp => resp.json())) as string[];

  const found = noteNames.find(e => e.includes(name));

  if (!found) {
    return new Response('', {
      status: 404,
      statusText: `Note with name ${name} is not found`,
    });
  }

  const note = await getObject(s3Client)(config.s3.bucket, found);

  return NextResponse.json(note);
}
