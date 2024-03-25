'use client';
import { ScrollShadow } from '@nextui-org/react';
import { TreeNode, TreeProps } from '@types';
import classNames from 'classnames';
import { FC, useState } from 'react';

const DEFAULT_ICON_SIZE = 16;

const Icon: FC<{ isExpanded: boolean }> = ({ isExpanded }) => (
  <svg
    className={classNames('duration-250 ease-linear', {
      'rotate-90': isExpanded,
    })}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1024 1024"
    width={DEFAULT_ICON_SIZE}
    height={DEFAULT_ICON_SIZE}
  >
    <path d="M383.291616 808.954249c-5.175883 0-10.353812-1.950422-14.338566-5.862521-8.064676-7.919367-8.182356-20.877493-0.26299-28.942169l273.602402-278.620695L368.69006 216.907145c-7.919367-8.064676-7.801686-21.022803 0.26299-28.942169 8.065699-7.918343 21.022803-7.80271 28.942169 0.26299l287.685141 292.960285c7.818059 7.961322 7.818059 20.717857 0 28.67918L397.895219 802.826692C393.887952 806.907637 388.591319 808.954249 383.291616 808.954249z" />
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
        {/* {isExpanded ? <Icon isExpanded /> : <FoldIcon />} */}
        <Icon isExpanded={isExpanded} />
        <span className="font-semibold max-w-[200px] text-base inline-block truncate">
          {node.name}
        </span>
      </button>
      <div
        className={classNames(
          'border-1 border-orange-700',
          isExpanded ? 'h-[100px]' : 'h-0',
          'transition-all',
        )}
      >
        <ul
          className={classNames(
            'ml-4',
            'transition-all',
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
