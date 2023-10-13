import { getCachedPostGraph } from '@utils/postUtil';
import { NextResponse } from 'next/server';

export async function GET() {
  const postGraph = await getCachedPostGraph();

  return NextResponse.json(postGraph);
}
