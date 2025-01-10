'use client';

import dynamic from 'next/dynamic';

const LayoutFA2 = dynamic(
  () => import('@/components/sigma/layout-fa2').then(mod => mod.LayoutFA2),
  {
    ssr: false,
  },
);

export default function Home() {
  return (
    <div className="h-screen w-full">
      <LayoutFA2 />
    </div>
  );
}
