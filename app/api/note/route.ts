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

  console.log('name:', name);

  const names = (await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/notes/names`,
    {
      cache: 'force-cache',
    },
  ).then(resp => resp.json())) as string[];

  const found = names.find(e => e.includes(name));

  if (!found) {
    return new Response('', {
      status: 404,
      statusText: `Note with name ${name} is not found`,
    });
  }

  console.log('found:', found);

  const note = await getObject(s3Client)(config.s3.bucket, found);

  return NextResponse.json(note);
}
