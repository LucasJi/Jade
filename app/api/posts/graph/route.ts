import { getPostGraph } from '@utils/postUtil';
import { NextResponse } from 'next/server';

export async function GET() {
  const postGraph = getPostGraph();

  return NextResponse.json(postGraph);
}
