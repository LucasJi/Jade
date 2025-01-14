import { Dataset, NodeData, Tag } from '@/components/sigma/types';
import { RK } from '@/lib/constants';
import { createRedisClient } from '@/lib/redis';
import { uniqBy } from 'lodash';
import { NextResponse } from 'next/server';

const redis = await createRedisClient();

export async function GET() {
  const rData = await redis.hVals(RK.GRAPH);
  const nodeDataList: NodeData[] = rData.map(data => JSON.parse(data));
  const edges: [string, string][] = [];
  const tags: Tag[] = [];

  for (const nodeData of nodeDataList) {
    const { tags: nodeTags, targets } = nodeData;
    if (nodeTags) {
      tags.push(...nodeTags.map(key => ({ key })));
    }
    for (const target of targets) {
      edges.push([nodeData.key, target]);
    }
  }

  const graphDataset: Dataset = {
    nodes: nodeDataList,
    edges: edges,
    tags: uniqBy(tags, 'key'),
  };

  return NextResponse.json(graphDataset);
}
