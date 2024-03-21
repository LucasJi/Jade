'use client';
import { ScrollShadow } from '@nextui-org/react';
import rightSvg from '@public/right.svg';
import unfoldSvg from '@public/unfold.svg';
import { TreeNode, TreeProps } from '@types';
import Image from 'next/image';
import React, { useState } from 'react';

const DEFAULT_ICON_SIZE = 16;

const RightIcon: React.FC = () => (
  <Image
    src={rightSvg}
    width={DEFAULT_ICON_SIZE}
    height={DEFAULT_ICON_SIZE}
    alt="Tree Right Icon"
  />
);

const UnfoldIcon: React.FC = () => (
  <Image
    src={unfoldSvg}
    width={DEFAULT_ICON_SIZE}
    height={DEFAULT_ICON_SIZE}
    alt="Tree Right Icon"
  />
);

const TreeNodeComponent: React.FC<{ node: TreeNode }> = ({ node }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return node.children ? (
    <li className="mt-1 transition-all">
      <button
        onClick={toggleExpand}
        className="flex items-center border-1 border-green-700"
      >
        {isExpanded ? <UnfoldIcon /> : <RightIcon />}
        <span className="font-semibold max-w-[200px] text-base inline-block truncate">
          {node.name}
        </span>
      </button>
      {isExpanded && (
        <div className="border-1 border-orange-700">
          <ul className="ml-4">
            {node.children.map(child => (
              <TreeNodeComponent key={child.id} node={child} />
            ))}
          </ul>
        </div>
      )}
    </li>
  ) : (
    <li className="mt-2 max-w-[200px] truncate border-1 border-blue-950">
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
