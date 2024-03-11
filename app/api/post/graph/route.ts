import {
  generatePostGraphFromPosts,
  getAdjacencyPosts,
  getPostByWikilink,
} from '@utils/postUtil';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams;
  const wikilink = searchParams.get('wikilink');

  if (!wikilink) {
    return NextResponse.json(null);
  }

  const post = getPostByWikilink(wikilink);

  if (!post) {
    return NextResponse.json(null);
  }

  const adjPosts = getAdjacencyPosts(post);

  const postGraph = generatePostGraphFromPosts(adjPosts);

  return NextResponse.json(postGraph);
}
