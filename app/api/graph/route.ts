import { RK } from '@/lib/constants';
import { createRedisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

const redis = await createRedisClient();

export async function GET() {
  const graph = await redis.hVals(RK.GRAPH);

  return NextResponse.json(graph.map(s => JSON.parse(s)));
}
