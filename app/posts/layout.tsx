'use client';
import fetcher from '@api/fetcher';
import LgSpinnerInCenter from '@components/LgSpinnerInCenter';
import { PostTreeNode } from '@types';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import { ElementType, ReactNode } from 'react';
import { Tree } from 'react-arborist';
import { NodeRendererProps } from 'react-arborist/dist/types/renderers';
import { RxChevronDown, RxChevronRight } from 'react-icons/rx';
import useSWR from 'swr';

export default function Layout({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const { data, isLoading } = useSWR('/api/posts/tree', fetcher);
  const { push } = useRouter();

  if (isLoading) {
    return <LgSpinnerInCenter />;
  }

  const Node: ElementType<NodeRendererProps<PostTreeNode>> | undefined = ({
    node,
    style,
  }) => {
    const {
      data: { name, id },
    } = node;
    return (
      <div
        style={style}
        className="flex items-center cursor-pointer"
        onClick={() => {
          if (!node.isLeaf) {
            node.isOpen ? node.close() : node.open();
          } else {
            push('/posts/' + id);
          }
        }}
      >
        {!node.isLeaf &&
          (node.isClosed ? (
            <RxChevronRight size={20} className="inline" />
          ) : (
            <RxChevronDown size={20} className="inline" />
          ))}
        <span>{node.isLeaf ? name.replace('.md', '') : name}</span>
      </div>
    );
  };

  return (
    <div className="w-full flex p-4 h-full">
      <div className="w-[calc((100%_-_1024px)_/_2)] pl-32 h-full">
        <Tree
          initialData={data}
          disableDrag
          disableDrop
          disableEdit
          disableMultiSelection
          openByDefault={false}
          indent={24}
          rowHeight={36}
          overscanCount={1}
          selection={segment || undefined}
          width={250}
          height={1000}
        >
          {Node}
        </Tree>
      </div>
      {children}
    </div>
  );
}
