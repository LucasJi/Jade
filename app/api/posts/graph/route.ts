import { getPostGraphFromPosts } from '@/utils/getPostGraphFromPosts';
import { getPosts } from '@/utils/getPosts';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('GET /api/posts/graph');
  const posts = await getPosts();
  const postGraph = await getPostGraphFromPosts(posts);

  return NextResponse.json(postGraph);
}
