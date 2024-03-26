import ForceDirectedGraph from '@components/ForceDirectedGraph';
import { PostGraph } from '@types';
import { getWikilinks } from '@utils/postUtil';
import { ReactNode } from 'react';

export default async function Layout({
  params: { wikilink },
  children,
}: {
  params: { wikilink: string };
  children: ReactNode;
}) {
  const decodedWikilink = decodeURIComponent(wikilink);

  const postGraphResp = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/post/graph?${new URLSearchParams({
      wikilink: decodedWikilink,
    })}`,
    {
      method: 'GET',
      cache: 'no-cache',
    },
  );
  const postGraph: PostGraph = await postGraphResp.json();

  return (
    <div className="flex w-full h-full relative">
      <div className="w-1/5 border">File Explorer(WIP)</div>
      <div className="w-3/5 p-4 flex-1 overflow-y-auto">{children}</div>
      <div className="w-1/5 p-4">
        <ForceDirectedGraph
          postGraph={postGraph}
          currentWikilink={decodedWikilink}
        />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return getWikilinks();
}
