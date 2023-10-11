'use client';
import { useSelectedLayoutSegment } from 'next/navigation';
import { ElementType, ReactNode } from 'react';
import { Tree } from 'react-arborist';
import { NodeRendererProps } from 'react-arborist/dist/types/renderers';
import { RxChevronDown, RxChevronRight } from 'react-icons/rx';
import useSWR from 'swr';
import fetcher from '@api/fetcher';
import LgSpinnerInCenter from '@components/LgSpinnerInCenter';

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
  const { data, isLoading } = useSWR('/api/posts/tree', fetcher);
  if (isLoading) {
    return <LgSpinnerInCenter />;
  }

  return (
    <div className="w-full flex p-4">
      <div className="w-[calc((100%_-_1024px)_/_2)] pl-[2rem]">
        <Tree
          idAccessor="name"
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
