import { NextResponse } from 'next/server';
import { getCachedPosts } from '@utils/postUtil';

export async function GET() {
  const posts = await getCachedPosts();

  return NextResponse.json(posts);
}
