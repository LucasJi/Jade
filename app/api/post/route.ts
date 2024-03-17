import { getPostBySlug, convertWikilinkToSlug } from '@utils/postUtil';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let { slug, wikilink } = await req.json();

  if (wikilink) {
    slug = convertWikilinkToSlug(wikilink);
  }

  const post = getPostBySlug(slug);
  return NextResponse.json(post);
}
