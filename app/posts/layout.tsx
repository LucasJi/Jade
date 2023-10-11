'use client';
import { useSelectedLayoutSegment } from 'next/navigation';
import { ElementType, ReactNode } from 'react';
import { Tree } from 'react-arborist';
import { NodeRendererProps } from 'react-arborist/dist/types/renderers';
import { RxChevronDown, RxChevronRight } from 'react-icons/rx';

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

const Node: ElementType<NodeRendererProps<any>> | undefined = ({
  node,
  style,
}) => {
  return (
    <div
      style={style}
      className="flex items-center"
      onClick={() => {
        if (!node.isLeaf) {
          node.isOpen ? node.close() : node.open();
        }
      }}
    >
      {!node.isLeaf &&
        (node.isClosed ? (
          <RxChevronRight size={24} className="inline" />
        ) : (
          <RxChevronDown size={24} className="inline" />
        ))}
      <span>{node.data.name}</span>
    </div>
  );
};

export default function Layout({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();
  console.log('segment', segment);
  return (
    <div className="w-full flex p-4">
      <div className="w-[calc((100%_-_1024px)_/_2)] pl-[2rem]">
        <Tree
          className="w-full h-full"
          initialData={data}
          disableDrag
          disableDrop
          disableEdit
          disableMultiSelection
          openByDefault={false}
          indent={36}
          rowHeight={36}
          overscanCount={1}
          paddingTop={30}
          paddingBottom={10}
          padding={25}
        >
          {Node}
        </Tree>
      </div>
      {children}
    </div>
  );
}
