import { getPosts } from '@utils/postUtil';
import { NextResponse } from 'next/server';

export async function GET() {
  const posts = getPosts();

  console.log('/api/posts');

  return NextResponse.json(posts);
}
