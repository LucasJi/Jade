import GraphView from '@components/GraphView';
import Toc from '@components/Toc';
import {
  generatePostGraphFromPosts,
  getAdjacencyPosts,
  getIds,
  getPostById,
} from '@utils/postUtil';
import { ReactNode } from 'react';

export default async function Layout({
  params: { id },
  children,
}: {
  params: { id: string };
  children: ReactNode;
}) {
  const decodedId = decodeURIComponent(id);

  const post = getPostById(decodedId);
  const adjPosts = getAdjacencyPosts(post!);
  const postGraph = generatePostGraphFromPosts(adjPosts);

  return (
    <div className="flex w-full h-full">
      <div className="w-2/3 p-4 flex-1 overflow-y-auto">{children}</div>
      <div className="w-1/4 p-4 flex flex-col overflow-y-auto">
        <GraphView postGraph={postGraph} postId={decodedId} />
        <Toc id={decodedId} className="mt-4" />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return getIds();
}
