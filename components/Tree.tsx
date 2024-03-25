'use client';
import { ScrollShadow } from '@nextui-org/react';
import { TreeNode, TreeProps } from '@types';
import classNames from 'classnames';
import { FC, useState } from 'react';

const DEFAULT_ICON_SIZE = 16;

const FoldIcon: FC<{ isExpanded: boolean }> = ({ isExpanded }) => (
  <svg
    className={classNames('transition-transform', {
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

const TreeNodeComponent: FC<{ node: TreeNode }> = ({ node }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return node.children ? (
    <li className="mt-1">
      <button
        onClick={toggleExpand}
        className="flex items-center border-1 border-green-700"
      >
        <FoldIcon isExpanded={isExpanded} />
        <span className="font-semibold max-w-[200px] text-base inline-block truncate">
          {node.name}
        </span>
      </button>
      <div
        className={classNames(
          'border-1 border-orange-700',
          isExpanded ? 'h-[100px]' : 'h-0',
          'transition-height',
        )}
      >
        <ul
          className={classNames(
            'ml-4',
            'transition-opacity',
            isExpanded ? 'opacity-100' : 'opacity-0',
            isExpanded ? 'visible' : 'invisible',
          )}
        >
          {node.children.map(child => (
            <TreeNodeComponent key={child.id} node={child} />
          ))}
        </ul>
      </div>
    </li>
  ) : (
    <li className="mt-1 w-fit max-w-[200px] truncate border-1 border-blue-950">
      <span className="text-sm font-normal">{node.name}</span>
    </li>
  );
};

const Tree: React.FC<TreeProps> = ({ data }) => {
  return (
    <ScrollShadow className="w-[400px] h-[300px] border-1 px-2 border-red-800 ">
      <ul>
        {data.map(node => (
          <TreeNodeComponent key={node.id} node={node} />
        ))}
      </ul>
    </ScrollShadow>
  );
};

export default Tree;
