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
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VscTarget } from 'react-icons/vsc';
import { Button } from '@/components/ui/button';
import { BiCollapseVertical, BiExpandVertical } from 'react-icons/bi';

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
  const { expandedNodeIds, id } = useContext(TreeContext);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    if (isExpanded) {
      expandedNodeIds.delete(node.id);
    } else {
      expandedNodeIds.add(node.id);
    }
    setIsExpanded(!isExpanded);
  };

  useLayoutEffect(() => {
    setIsExpanded(expandedNodeIds.has(node.id));
  }, [expandedNodeIds]);

  return node.isDir ? (
    <li className="mt-1">
      <button onClick={toggleExpand} className="flex items-center">
        <FoldIcon isExpanded={isExpanded} />
        <span className="min-h-0 max-w-[200px] text-base inline-block truncate ml-1">
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
      className={clsx(
        'mt-1 w-fit max-w-[200px] truncate hover:underline ml-1',
        node.id === id && 'underline',
      )}
      title={node.name}
      id={node.id}
    >
      <Link
        href={`/posts/${node.id || ''}`}
        className="min-h-0 text-base"
        // Reduce unnecessary requests
        prefetch={false}
      >
        {node.name}
      </Link>
    </li>
  );
};

const TreeContext = createContext<{
  expandedNodeIds: Set<string>;
  id: string;
}>({
  expandedNodeIds: new Set(),
  id: '',
});

const Tree: React.FC<TreeProps> = ({ className }) => {
  const [data, setData] = useState<TreeNode[]>([]);
  let { id } = useParams<{ id: string }>();
  id = decodeURIComponent(id);

  const viewportRef = useRef<HTMLDivElement>(null);

  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
    new Set(),
  );

  const expandAll = (nodes: TreeNode[] | undefined) => {
    if (!nodes) {
      return;
    }

    for (const node of nodes) {
      expandedNodeIds.add(node.id);

      if (node.children.length > 0) {
        expandAll(node.children);
      }
    }
  };

  const contains = (nodes: TreeNode[] | undefined): boolean => {
    if (!nodes) {
      return false;
    }

    for (const node of nodes) {
      if (node.id === id) {
        return true;
      }

      if (contains(node.children)) {
        expandedNodeIds.add(node.id);
        return true;
      }
    }

    return false;
  };

  const selectOpenedPost = () => {
    contains(data);
    setExpandedNodeIds(new Set([...expandedNodeIds]));
    setTimeout(() => {
      if (viewportRef !== null && viewportRef.current !== null) {
        viewportRef.current
          .querySelector(`#${CSS.escape(id)}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 300);
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts-tree`)
      .then(res => res.json())
      .then(data => setData(data))
      .then(() => selectOpenedPost());
  }, [id]);

  return (
    <div className={clsx('px-2', className)}>
      <div className="flex flex-row items-center justify-end">
        <Button
          title="Select Opened Post"
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded-full"
          onClick={() => {
            selectOpenedPost();
          }}
        >
          <VscTarget size={16} />
        </Button>
        <Button
          title="Expand All"
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded-full"
          onClick={() => {
            expandAll(data);
            setExpandedNodeIds(new Set([...expandedNodeIds]));
          }}
        >
          <BiExpandVertical size={16} />
        </Button>
        <Button
          title="Collapse All"
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded-full"
          onClick={() => {
            setExpandedNodeIds(new Set());
            if (viewportRef !== null && viewportRef.current !== null) {
              viewportRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <BiCollapseVertical size={16} />
        </Button>
      </div>
      <ScrollArea className="w-full h-full mt-2" viewportRef={viewportRef}>
        <ul>
          <TreeContext.Provider value={{ expandedNodeIds, id }}>
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
