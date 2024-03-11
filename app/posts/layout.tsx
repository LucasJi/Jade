'use client';
import fetcher from '@api/fetcher';
import ForceDirectedGraph from '@components/ForceDirectedGraph';
import { Link, Spinner, Tooltip } from '@nextui-org/react';
import { PostTreeNode } from '@types';
import NextLink from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import React, { ElementType, ReactNode } from 'react';
import { Tree } from 'react-arborist';
import { NodeRendererProps } from 'react-arborist/dist/types/renderers';
import { RxChevronDown, RxChevronRight } from 'react-icons/rx';
import useSWR from 'swr';

export default function Layout({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment() || '';
  const { data: tree, isLoading: isLoadingTree } = useSWR(
    '/api/posts/tree',
    fetcher,
  );

  const { data: postGraph } = useSWR(
    '/api/post/graph?' +
      new URLSearchParams({
        wikilink: segment,
      }),
    fetcher,
  );

  const Node: ElementType<NodeRendererProps<PostTreeNode>> | undefined = ({
    node,
    style,
  }) => {
    const {
      data: { name, id },
    } = node;

    if (node.isLeaf) {
      return (
        <div style={style} className="flex items-center overflow-x-hidden">
          <Link
            href={`/posts/${id}`}
            size="sm"
            color="foreground"
            as={NextLink}
            underline={id === segment ? 'always' : 'hover'}
          >
            <Tooltip content={name} delay={1500} placement="top">
              <span className="w-40 truncate">{name.replace('.md', '')}</span>
            </Tooltip>
          </Link>
        </div>
      );
    }

    const { children } = node;
    let fileCount = 0;
    let folderCount = 0;

    if (children) {
      for (const child of children) {
        if (child.isLeaf) {
          fileCount++;
        } else {
          folderCount++;
        }
      }
    }

    const tooltipContent = (
      <div className="text-center">
        <span>{name}</span>
        <br />
        <span>{`${fileCount} file${
          fileCount > 0 ? 's' : ''
        } ${folderCount} folder${folderCount > 0 ? 's' : ''}`}</span>
      </div>
    );

    return (
      <div style={style} className="flex items-center overflow-x-hidden">
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
          <Tooltip content={tooltipContent} delay={1500} placement="top">
            <span className="w-40 truncate">{name}</span>
          </Tooltip>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex p-4 h-full">
      <div className="w-[calc((100%_-_1024px)_/_2)] pl-32 h-full overscroll-contain">
        {isLoadingTree ? (
          <Spinner color="primary" size="lg" />
        ) : (
          segment && (
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
          )
        )}
      </div>
      {children}
      {postGraph && (
        <ForceDirectedGraph
          className="fixed right-12 "
          basePostWikilinks={[segment]}
          postGraph={postGraph}
          height={300}
          width={300}
          scale={0.6}
        />
      )}
    </div>
  );
}
