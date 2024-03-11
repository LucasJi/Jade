import { NextResponse } from 'next/server';
import { getPosts } from '@utils/postUtil';

export async function GET() {
  const posts = getPosts();

  return NextResponse.json(posts);
}
