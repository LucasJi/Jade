'use client';

import { ScrollShadow } from '@nextui-org/scroll-shadow';
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
import { Input } from '@nextui-org/input';

const DEFAULT_ICON_SIZE = 16;

const FoldIcon: FC<{ isExpanded: boolean }> = ({ isExpanded }) => (
  <svg
    className={clsx('transition-transform', {
      'rotate-90': isExpanded,
    })}
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

const SearchIcon = (
  props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>,
) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
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
        <span className="min-h-0 font-semibold max-w-[200px] text-base inline-block truncate">
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
            { 'opacity-100 visible': isExpanded },
            { 'opacity-0 invisible': !isExpanded },
          )}
        >
          {node.children.map((child, idx) => (
            <TreeNodeComponent key={`${idx}-${child.name}`} node={child} />
          ))}
        </ul>
      </div>
    </li>
  ) : (
    <li className={clsx('mt-1 w-fit max-w-[200px] truncate')}>
      <Link
        href={`/posts/${encodeURIComponent(node.path || '')}`}
        className="min-h-0 text-base font-normal"
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
      <div className="w-[340px] h-[240px] px-8 rounded-2xl flex justify-center items-center bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg">
        <Input
          label="Search"
          isClearable
          radius="lg"
          classNames={{
            label: 'text-black/50 dark:text-white/90',
            input: [
              'bg-transparent',
              'text-black/90 dark:text-white/90',
              'placeholder:text-default-700/50 dark:placeholder:text-white/60',
            ],
            innerWrapper: 'bg-transparent',
            inputWrapper: [
              'shadow-xl',
              'bg-default-200/50',
              'dark:bg-default/60',
              'backdrop-blur-xl',
              'backdrop-saturate-200',
              'hover:bg-default-200/70',
              'dark:hover:bg-default/70',
              'group-data-[focus=true]:bg-default-200/50',
              'dark:group-data-[focus=true]:bg-default/60',
              '!cursor-text',
            ],
          }}
          placeholder="Type to search..."
          startContent={
            <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
          }
        />
      </div>
      <ScrollShadow className="w-full h-full mt-2">
        <ul>
          <TreeContext.Provider value={expandedNodeNames}>
            {data.map((node, idx) => (
              <TreeNodeComponent key={`${idx}-${node.name}`} node={node} />
            ))}
          </TreeContext.Provider>
        </ul>
      </ScrollShadow>
    </div>
  );
};

export default Tree;
