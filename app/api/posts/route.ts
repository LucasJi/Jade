import { NextResponse } from 'next/server';
import { getPosts } from '@utils/postUtil';

export async function GET() {
  const posts = await getPosts();

  return NextResponse.json(posts);
}
