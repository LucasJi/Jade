import { S3 } from '@/lib/server/s3';
import { NextRequest, NextResponse } from 'next/server';

const s3 = new S3();
const expiry = 24 * 60 * 60;

export const revalidate = expiry;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json('');
  }

  const bucketItems = await s3.listObjects();
  const itemNames = bucketItems.map(i => i.name);
  const found = itemNames.find(i => i.includes(name));

  if (!found) {
    return NextResponse.json('');
  }

  const presignedUrl = await s3.presignedGetObject(found, expiry);
  return NextResponse.json(presignedUrl);
}
