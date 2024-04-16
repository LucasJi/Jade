import { getPostById, getWikilinks } from '@utils/postUtil';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const wikilink: string = decodeURIComponent(
    req.nextUrl.searchParams.get('wikilink') || '',
  );

  const wikilinks: string[] = getWikilinks();

  const splits = wikilink.split('#');

  let post = null;
  const title = splits[0];
  const completeWikilink = wikilinks.find(
    l => l === title || l.includes(title),
  );
  if (completeWikilink) {
    const id = btoa(completeWikilink);
    post = getPostById(id);
  }

  return NextResponse.json(post);
}
