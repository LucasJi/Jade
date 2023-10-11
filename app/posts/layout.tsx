'use client';
import { useSelectedLayoutSegment } from 'next/navigation';
import { ElementType, ReactNode } from 'react';
import { Tree } from 'react-arborist';
import { NodeRendererProps } from 'react-arborist/src/types/renderers';

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

function node({
  node,
  style,
  dragHandle,
}: NodeRendererProps<any>): ElementType {
  return (
    <div
      style={style}
      ref={dragHandle}
      onClick={() => {
        if (!node.isLeaf) {
          node.isOpen ? node.close() : node.open();
        }
      }}
    >
      {node.isLeaf ? '🍁' : '🗀'}
      {node.data.name}
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();
  console.log('segment', segment);
  return (
    <div className="w-full flex p-4">
      <div className="w-[calc((100%_-_1024px)_/_2)]">
        <Tree
          initialData={data}
          openByDefault={false}
          width={600}
          height={1000}
          indent={24}
          rowHeight={36}
          overscanCount={1}
          paddingTop={30}
          paddingBottom={10}
          padding={25}
        >
          {node}
        </Tree>
      </div>
      {children}
    </div>
  );
}
