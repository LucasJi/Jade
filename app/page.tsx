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
    <LayoutFA2
      style={{
        width: '600px',
        height: '600px',
      }}
    />
  );
}
