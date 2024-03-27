import ForceDirectedGraph from '@components/ForceDirectedGraph';
import Tree from '@components/Tree';
import { PostGraph } from '@types';
import { getIds } from '@utils/postUtil';
import { ReactNode } from 'react';

export default async function Layout({
  params: { id },
  children,
}: {
  params: { id: string };
  children: ReactNode;
}) {
  const decodedId = decodeURIComponent(id);

  const postGraph: PostGraph = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/post/${decodedId}/graph`,
    {
      method: 'GET',
    },
  ).then(resp => resp.json());

  const postTree = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/tree`,
    {
      method: 'GET',
    },
  ).then(resp => resp.json());

  return (
    <div className="flex w-full h-full relative">
      <div className="w-1/5 p-4">
        <Tree data={postTree} currentNodeId={decodedId} />
      </div>
      <div className="w-3/5 p-4 flex-1 overflow-y-auto">{children}</div>
      <div className="w-1/5 p-4">
        <ForceDirectedGraph postGraph={postGraph} currentId={decodedId} />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return getIds();
}
