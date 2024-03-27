import { getPostById } from '@utils/postUtil';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params: { id } }: { params: { id: string } },
) {
  const post = getPostById(id);

  return NextResponse.json(post);
}
