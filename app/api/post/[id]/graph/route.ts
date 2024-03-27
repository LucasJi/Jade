import {
  generatePostGraphFromPosts,
  getAdjacencyPosts,
  getPostById,
} from '@utils/postUtil';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id: string } },
) {
  const post = getPostById(id);

  if (!post) {
    return NextResponse.json(null);
  }

  const adjPosts = getAdjacencyPosts(post);

  const postGraph = generatePostGraphFromPosts(adjPosts);

  return NextResponse.json(postGraph);
}
