'use client';

import useSWR from 'swr';
import fetcher from '../api/fetcher';
import LgSpinnerInCenter from '@components/LgSpinnerInCenter';
import ForceDirectedGraph from '@components/ForceDirectedGraph';
import { PostGraph } from '@types';

export default function ForceDirectedGraph1() {
  const { data, error } = useSWR<PostGraph>('/api/post/graph', fetcher);

  if (error) {
    return <div>failed to load</div>;
  }

  if (!data) {
    return <LgSpinnerInCenter />;
  }

  return <ForceDirectedGraph postGraph={data} />;
}
