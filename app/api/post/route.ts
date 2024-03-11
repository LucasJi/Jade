import { getPostBySlug } from '@utils/postUtil';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { slug } = await req.json();
  const post = getPostBySlug(slug);
  return NextResponse.json(post);
}
