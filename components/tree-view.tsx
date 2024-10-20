'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { TreeViewNode, TreeViewProps } from '@types';
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

const TreeViewNode: FC<{ node: TreeViewNode }> = ({ node }) => {
  const { expandedNoteNameSet, id } = useContext(TreeViewContext);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    if (isExpanded) {
      expandedNoteNameSet.delete(node.name);
    } else {
      expandedNoteNameSet.add(node.name);
    }
    setIsExpanded(!isExpanded);
  };

  useLayoutEffect(() => {
    setIsExpanded(expandedNoteNameSet.has(node.name));
  }, [expandedNoteNameSet]);

  return node.isDir ? (
    <li className="mt-1">
      <button onClick={toggleExpand} className="flex items-center">
        <ChevronRight
          size={16}
          className={cn('transition-transform', { 'rotate-90': isExpanded })}
          color="#5C5C5C"
        />
        <span className="ml-1 inline-block min-h-0 max-w-[200px] truncate text-base font-semibold">
          {node.name}
        </span>
      </button>
      <div
        className={cn(
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          'grid overflow-hidden transition-all',
        )}
      >
        <ul
          className={cn(
            'ml-4 min-h-0 transition-all',
            isExpanded ? 'visible opacity-100' : 'invisible opacity-0',
          )}
        >
          {node.children.map((child, idx) => (
            <TreeViewNode key={`${idx}-${child.name}`} node={child} />
          ))}
        </ul>
      </div>
    </li>
  ) : (
    <li
      className={cn(
        'ml-1 mt-1 w-fit max-w-[200px] truncate text-[#5c5c5c] decoration-obsidian hover:underline',
        { underline: node.name === id },
      )}
      title={node.name}
      id={node.name}
    >
      <Link
        href={`/notes/${node.name || ''}`}
        className="min-h-0 text-base"
        // Reduce unnecessary requests
        prefetch={false}
      >
        {node.name}
      </Link>
    </li>
  );
};

const TreeViewContext = createContext<{
  expandedNoteNameSet: Set<string>;
  id: string;
}>({
  expandedNoteNameSet: new Set(),
  id: '',
});

const TreeView: React.FC<TreeViewProps> = ({ className }) => {
  const [treeNodes, setTreeNodes] = useState<TreeViewNode[]>([]);
  let { id } = useParams<{ id: string }>();
  id = decodeURIComponent(id);

  const viewportRef = useRef<HTMLDivElement>(null);

  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
    new Set(),
  );

  const expandAll = (nodes: TreeViewNode[] | undefined) => {
    if (!nodes) {
      return;
    }

    for (const node of nodes) {
      expandedNodeIds.add(node.name);

      if (node.children.length > 0) {
        expandAll(node.children);
      }
    }
  };

  const contains = (nodes: TreeViewNode[] | undefined): boolean => {
    if (!nodes) {
      return false;
    }

    for (const node of nodes) {
      if (node.name === id) {
        return true;
      }

      if (contains(node.children)) {
        expandedNodeIds.add(node.name);
        return true;
      }
    }

    return false;
  };

  const selectOpenedNote = () => {
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
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tree`)
      .then(res => res.json())
      .then(data => {
        setTreeNodes(data);
      });
  }, [id]);

  useEffect(() => {
    selectOpenedNote();
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
            selectOpenedNote();
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
          <TreeViewContext.Provider
            value={{ expandedNoteNameSet: expandedNodeIds, id }}
          >
            {treeNodes.map((node, idx) => (
              <TreeViewNode key={`${idx}-${node.name}`} node={node} />
            ))}
          </TreeViewContext.Provider>
        </ul>
      </ScrollArea>
    </div>
  );
};

export default TreeView;
