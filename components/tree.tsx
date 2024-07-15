'use client';

import { TreeNode, TreeProps } from '@types';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import clsx from 'clsx';
import { ScrollArea } from '@/components/ui/scroll-area';

const DEFAULT_ICON_SIZE = 16;

const FoldIcon: FC<{ isExpanded: boolean }> = ({ isExpanded }) => (
  <svg
    className={clsx('transition-transform', isExpanded && 'rotate-90')}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    width={DEFAULT_ICON_SIZE}
    height={DEFAULT_ICON_SIZE}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m8.25 4.5 7.5 7.5-7.5 7.5"
    />
  </svg>
);

const TreeNodeComponent: FC<{ node: TreeNode }> = ({ node }) => {
  const expandedNodeNames = useContext(TreeContext);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useLayoutEffect(() => {
    if (!isExpanded) {
      setIsExpanded(expandedNodeNames.includes(node.name));
    }
  }, [expandedNodeNames]);

  return node.isDir ? (
    <li className="mt-1">
      <button onClick={toggleExpand} className="flex items-center">
        <FoldIcon isExpanded={isExpanded} />
        <span className="min-h-0 max-w-[200px] text-base inline-block truncate">
          {node.name}
        </span>
      </button>
      <div
        className={clsx(
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          'transition-all',
          'grid',
          'overflow-hidden',
        )}
      >
        <ul
          className={clsx(
            'min-h-0',
            'ml-4',
            'transition-all',
            isExpanded ? 'opacity-100 visible' : 'opacity-0 invisible',
          )}
        >
          {node.children.map((child, idx) => (
            <TreeNodeComponent key={`${idx}-${child.name}`} node={child} />
          ))}
        </ul>
      </div>
    </li>
  ) : (
    <li
      className={clsx('mt-1 w-fit max-w-[200px] truncate hover:underline')}
      title={node.name}
    >
      <Link
        href={`/posts/${encodeURIComponent(node.path || '')}`}
        className="min-h-0 text-base"
        // Reduce unnecessary requests
        prefetch={false}
      >
        {node.name}
      </Link>
    </li>
  );
};

const TreeContext = createContext<string[]>([]);

const Tree: React.FC<TreeProps> = ({ data, className }) => {
  let { id } = useParams<{ id: string }>();
  id = decodeURIComponent(id);

  const [expandedNodeNames, setExpandedNodeNames] = useState<string[]>([]);

  useEffect(() => {
    const nodeNames: string[] = [];
    const contains = (nodes: TreeNode[] | undefined): boolean => {
      if (!nodes) {
        return false;
      }

      for (const node of nodes) {
        if (node.path === id) {
          return true;
        }

        if (contains(node.children)) {
          nodeNames.push(node.name);
          return true;
        }
      }

      return false;
    };

    contains(data);

    setExpandedNodeNames([...nodeNames]);
  }, [id]);

  return (
    <div className={clsx('px-2', className)}>
      <ScrollArea className="w-full h-full mt-2">
        <ul>
          <TreeContext.Provider value={expandedNodeNames}>
            {data.map((node, idx) => (
              <TreeNodeComponent key={`${idx}-${node.name}`} node={node} />
            ))}
          </TreeContext.Provider>
        </ul>
      </ScrollArea>
    </div>
  );
};

export default Tree;
