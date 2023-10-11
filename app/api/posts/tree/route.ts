import { getPostTree } from '@utils/postUtil';
import { NextResponse } from 'next/server';

export async function GET() {
  const postTree = getPostTree();

  return NextResponse.json(postTree);
}
