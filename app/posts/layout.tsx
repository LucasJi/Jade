'use client';
import { ReactNode } from 'react';
import {
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
} from 'next/navigation';
import { Tree } from 'react-arborist';

const data = [
  { id: '1', name: 'Unread' },
  { id: '2', name: 'Threads' },
  {
    id: '3',
    name: 'Chat Rooms',
    children: [
      { id: 'c1', name: 'General' },
      { id: 'c2', name: 'Random' },
      { id: 'c3', name: 'Open Source Projects' },
    ],
  },
  {
    id: '4',
    name: 'Direct Messages',
    children: [
      { id: 'd1', name: 'Alice' },
      { id: 'd2', name: 'Bob' },
      { id: 'd3', name: 'Charlie' },
    ],
  },
];

export default function Layout({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const segment = useSelectedLayoutSegment();
  console.log('segments', segments);
  console.log('segment', segment);
  return (
    <div className="w-full flex p-4">
      <div className="w-[calc((100%_-_1024px)_/_2)]">
        <Tree className="ml-20" initialData={data} />
      </div>
      {children}
    </div>
  );
}
