import { listExistedObjs } from '@/lib/note';
import { S3 } from '@/lib/server/s3';
import { NextRequest, NextResponse } from 'next/server';

const s3 = new S3();

// export const revalidate = 86400;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json('');
  }

  const objs = listExistedObjs(await s3.listObjectVersions());
  const found = objs.find(o => o.path.includes(name));

  if (!found) {
    return NextResponse.json('');
  }

  const payload = await s3.getObject(found.path);
  return new Response(payload?.transformToWebStream());
}
