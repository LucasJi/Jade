import { getPostById, getWikilinks } from '@utils/postUtil';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { wikilink } = await req.json();
  const wikilinks: string[] = getWikilinks();

  const completeWikilink = wikilinks.find(
    l => l === wikilink || l.includes(wikilink),
  );

  if (!completeWikilink) {
    return NextResponse.json(null);
  }

  const id = btoa(completeWikilink);
  const post = getPostById(id);

  return NextResponse.json(post);
}
