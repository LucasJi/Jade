import {
  generatePostGraphFromPosts,
  getAdjacencyPosts,
  getCachedPostByWikilink,
} from '@utils/postUtil';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams;
  const wikilink = searchParams.get('wikilink');

  if (!wikilink) {
    return NextResponse.json(null);
  }

  const post = await getCachedPostByWikilink(wikilink);
  const adjPosts = await getAdjacencyPosts(post);
  const postGraph = generatePostGraphFromPosts(adjPosts);

  return NextResponse.json(postGraph);
}
