'use client';

import dynamic from 'next/dynamic';

const Graph = dynamic(
  () => import('@/components/sigma/graph').then(mod => mod.Graph),
  {
    ssr: false,
  },
);

const Root = dynamic(() =>
  import('@/components/sigma/root').then(mod => mod.default),
);

export default function Home() {
  return (
    <div className="h-screen w-full">
      <div className="h-[750px] w-full">
        {/*<Graph />*/}
        <Root />
      </div>
    </div>
  );
}
