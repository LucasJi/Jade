import ForceDirectedGraph from '@components/ForceDirectedGraph';
import React from 'react';
import { PostGraph } from '@types';

export default async function Posts() {
  const postGraphResp = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/graph`,
    { method: 'GET' },
  );
  const postGraph: PostGraph = await postGraphResp.json();

  // TODO: Refactor Posts page
  return (
    <div>
      <ForceDirectedGraph postGraph={postGraph} width={300} height={300} />
    </div>
  );
}
