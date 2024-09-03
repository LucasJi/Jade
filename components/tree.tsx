'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TreeNode, TreeProps } from '@types';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { BiCollapseVertical, BiExpandVertical } from 'react-icons/bi';
import { VscTarget } from 'react-icons/vsc';

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
        <ChevronRight
          size={16}
          className={clsx('transition-transform', { 'rotate-90': isExpanded })}
          color="#5C5C5C"
        />
        <span className="ml-1 inline-block min-h-0 max-w-[200px] truncate text-base font-medium">
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
            isExpanded ? 'visible opacity-100' : 'invisible opacity-0',
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
        'ml-1 mt-1 w-fit max-w-[200px] truncate text-[#5c5c5c] hover:underline',
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
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
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
    contains(treeNodes);
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
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/tree`)
      .then(res => res.json())
      .then(data => {
        setTreeNodes(data);
      });
  }, [id]);

  useEffect(() => {
    selectOpenedPost();
  }, [treeNodes]);

  return (
    <div className={clsx('px-2', className)}>
      <div className="flex flex-row items-center justify-end">
        <Button
          title="Select Opened Note"
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
            expandAll(treeNodes);
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
      <ScrollArea className="mt-2 h-full w-full" viewportRef={viewportRef}>
        <ul>
          <TreeContext.Provider value={{ expandedNodeIds, id }}>
            {treeNodes.map((node, idx) => (
              <TreeNodeComponent key={`${idx}-${node.name}`} node={node} />
            ))}
          </TreeContext.Provider>
        </ul>
      </ScrollArea>
    </div>
  );
};

export default Tree;
