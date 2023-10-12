'use client';
import fetcher from '@api/fetcher';
import LgSpinnerInCenter from '@components/LgSpinnerInCenter';
import { PostTreeNode } from '@types';
import { useSelectedLayoutSegment } from 'next/navigation';
import { ElementType, ReactNode } from 'react';
import { Tree } from 'react-arborist';
import { NodeRendererProps } from 'react-arborist/dist/types/renderers';
import { RxChevronDown, RxChevronRight } from 'react-icons/rx';
import useSWR from 'swr';
import { Link } from '@nextui-org/react';
import NextLink from 'next/link';

export default function Layout({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const { data, isLoading } = useSWR('/api/posts/tree', fetcher);

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
      <div style={style} className="flex items-center overflow-hidden">
        {node.isLeaf ? (
          <Link
            href={`/posts/${id}`}
            size="sm"
            color="foreground"
            as={NextLink}
            underline={id === segment ? 'always' : 'hover'}
          >
            <span className="truncate w-40">{name.replace('.md', '')}</span>
          </Link>
        ) : (
          <div
            className="text-small flex cursor-pointer"
            onClick={() => {
              node.isOpen ? node.close() : node.open();
            }}
          >
            {node.isClosed ? (
              <RxChevronRight size={20} className="inline" />
            ) : (
              <RxChevronDown size={20} className="inline" />
            )}
            <span className="truncate w-40">{name}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex p-4 h-full">
      <div className="w-[calc((100%_-_1024px)_/_2)] pl-32 h-full">
        <Tree
          rowClassName="flex"
          initialData={data}
          disableDrag
          disableDrop
          disableEdit
          disableMultiSelection
          openByDefault={false}
          indent={24}
          rowHeight={36}
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
