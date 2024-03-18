'use client';
import { Accordion, AccordionItem } from '@nextui-org/react';
import rightSvg from '@public/right.svg';
import unfoldSvg from '@public/unfold.svg';
import { TreeNode, TreeProps } from '@types';
import Image from 'next/image';
import React from 'react';

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
  // const [isExpanded, setIsExpanded] = useState(false);

  // const toggleExpand = () => {
  //   setIsExpanded(!isExpanded);
  // };

  return node.children ? (
    <Accordion>
      {node.children.map(child => (
        <TreeNodeComponent key={child.id} node={child} />
      ))}
    </Accordion>
  ) : (
    <AccordionItem>{node.name}</AccordionItem>
  );
};

const Tree: React.FC<TreeProps> = ({ data }) => {
  return (
    <Accordion>
      {data.map(node => (
        <TreeNodeComponent key={node.id} node={node} />
      ))}
    </Accordion>
  );
};

export default Tree;
