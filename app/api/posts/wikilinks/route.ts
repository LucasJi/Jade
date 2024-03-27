import { getWikilinks } from '@utils/postUtil';
import { NextResponse } from 'next/server';

export async function GET() {
  const wikilinks = getWikilinks();

  return NextResponse.json(wikilinks);
}
