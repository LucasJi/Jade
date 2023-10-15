'use client';
import fetcher from '@api/fetcher';
import ForceDirectedGraph from '@components/ForceDirectedGraph';
import LgSpinnerInCenter from '@components/LgSpinnerInCenter';
import { Link } from '@nextui-org/react';
import { PostTreeNode } from '@types';
import NextLink from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { ElementType, ReactNode } from 'react';
import { NodeRendererProps } from 'react-arborist/dist/types/renderers';
import { RxChevronDown, RxChevronRight } from 'react-icons/rx';
import useSWR from 'swr';
import { Tree } from 'react-arborist';

export default function Layout({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const { data: tree, isLoading: isLoadingTree } = useSWR(
    '/api/posts/tree',
    fetcher,
  );

  const { data: postGraph } = useSWR(
    '/api/post/graph?' +
      new URLSearchParams({
        wikilink: segment || '',
      }),
    fetcher,
  );

  if (isLoadingTree) {
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
      <div style={style} className="flex items-center">
        {node.isLeaf ? (
          <Link
            href={`/posts/${id}`}
            size="sm"
            color="foreground"
            as={NextLink}
            underline={id === segment ? 'always' : 'hover'}
          >
            <span className="w-40">{name.replace('.md', '')}</span>
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
            <span className="w-40">{name}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex p-4 h-full">
      {segment && (
        <div className="w-[calc((100%_-_1024px)_/_2)] pl-32 h-full overscroll-contain">
          <Tree
            rowClassName="flex"
            initialData={tree}
            disableDrag
            disableDrop
            disableEdit
            disableMultiSelection
            openByDefault={false}
            indent={24}
            rowHeight={36}
            selection={segment || undefined}
            width={250}
            height={500}
          >
            {Node}
          </Tree>
        </div>
      )}
      {children}
      {postGraph && (
        <ForceDirectedGraph
          className="fixed right-0"
          postGraph={postGraph}
          height={400}
          width={400}
          scale={0.6}
        />
      )}
    </div>
  );
}
