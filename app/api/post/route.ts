import { getPostByWikilink } from '@utils/postUtil';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { wikilink } = data;

  console.log('wikilink', wikilink);

  const post = getPostByWikilink(wikilink);
  return NextResponse.json(post);
}
