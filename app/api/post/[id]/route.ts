import { getPostById } from '@utils/postUtil';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } },
) {
  const post = getPostById(id);
  return NextResponse.json(post);
}
