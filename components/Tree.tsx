'use client';
import { TreeNode, TreeProps } from '@types';
import React, { useState } from 'react';

const TreeNodeComponent: React.FC<{ node: TreeNode }> = ({ node }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div onClick={toggleExpand}>
        {isExpanded ? '▼' : '►'} {node.name}
      </div>
      {isExpanded && node.children && (
        <div style={{ marginLeft: 20 }}>
          {node.children.map(child => (
            <TreeNodeComponent key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const Tree: React.FC<TreeProps> = ({ data }) => {
  return (
    <div>
      {data.map(node => (
        <TreeNodeComponent key={node.id} node={node} />
      ))}
    </div>
  );
};

export default Tree;
