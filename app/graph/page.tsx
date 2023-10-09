'use client';

import useSWR from 'swr';
import fetcher from '../api/fetcher';
import ForceDirectedGraph from '@components/ForceDirectedGraph';
import { PostGraph } from '@types';
import LgSpinnerInCenter from '@components/LgSpinnerInCenter';

export default function Graph() {
  const { data } = useSWR<PostGraph>('/api/post/graph', fetcher);

  if (!data) {
    return <LgSpinnerInCenter />;
  }

  return <ForceDirectedGraph postGraph={data} className="mx-auto" />;
}
