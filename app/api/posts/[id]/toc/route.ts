import { getPostById, getPostToc } from '@utils/postUtil';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } },
) {
  const post = getPostById(id);

  if (!post) {
    return NextResponse.json(null);
  }

  const result = getPostToc(post.content);

  return NextResponse.json(result);
}
