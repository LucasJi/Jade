import { convertWikilinkToSlug, getPostBySlug } from '@utils/postUtil';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  let { slug } = data;
  const { wikilink } = data;

  if (wikilink) {
    slug = convertWikilinkToSlug(wikilink);
  }

  const post = getPostBySlug(slug);
  return NextResponse.json(post);
}
