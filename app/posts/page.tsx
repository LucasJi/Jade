'use client';

import fetcher from '@api/fetcher';
import ForceDirectedGraph from '@components/ForceDirectedGraph';
import LgSpinnerInCenter from '@components/LgSpinnerInCenter';
import { PostGraph } from '@types';
import React from 'react';
import useSWR from 'swr';

function Posts() {
  const { data } = useSWR<PostGraph>('/api/post/graph', fetcher);

  if (!data) {
    return <LgSpinnerInCenter />;
  }

  return <ForceDirectedGraph postGraph={data} className="mx-auto" />;
}

export default Posts;
