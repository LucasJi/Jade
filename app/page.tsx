'use client';

import dynamic from 'next/dynamic';

const Root = dynamic(
  () => import('@/components/sigma/root').then(mod => mod.default),
  {
    ssr: false,
  },
);

export default function Home() {
  return (
    <div className="h-screen w-full">
      <div className="h-[750px] w-full">
        <Root />
      </div>
    </div>
  );
}
