'use client';
import { useSelectedLayoutSegment } from 'next/navigation';
import { CSSProperties, ReactNode } from 'react';
import { NodeApi, Tree, TreeApi } from 'react-arborist';

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
  tree,
}: {
  node: NodeApi;
  style: CSSProperties;
  tree: TreeApi;
}) {
  return (
    <div style={style} ref={dragHandle}>
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
          disableDrop
          disableEdit
          disableMultiSelection
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
