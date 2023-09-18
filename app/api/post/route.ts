import { getCachedPostBySlug } from '@utils/postUtil';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { slug } = await req.json();

  const post = await getCachedPostBySlug(slug);

  return NextResponse.json(post);
}
