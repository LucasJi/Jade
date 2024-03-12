import { PostGraph } from '@types';
import { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
  const treeResp = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/tree`,
    {
      method: 'GET',
    },
  );
  const tree = await treeResp.json();

  const postGraphResp = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/post/graph?${new URLSearchParams({
      wikilink: '',
    })}`,
    {
      method: 'GET',
    },
  );
  const postGraph: PostGraph = await postGraphResp.json();

  return (
    <div className="flex w-full h-full relative">
      <div className="w-1/5 bg-green-300">File Explorer(WIP)</div>
      <div className="w-3/5 p-4 flex-1 overflow-y-auto">{children}</div>
      <div className="w-1/5 bg-orange-200">Graph View</div>
      {/*{postGraph && (*/}
      {/*  <ForceDirectedGraph*/}
      {/*    className="fixed right-12 "*/}
      {/*    basePostWikilinks={[]}*/}
      {/*    postGraph={postGraph}*/}
      {/*    height={300}*/}
      {/*    width={300}*/}
      {/*    scale={0.6}*/}
      {/*  />*/}
      {/*)}*/}
    </div>
  );
}
