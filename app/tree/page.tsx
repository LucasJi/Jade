'use client';
import Tree from '@components/Tree';
import { TreeNode } from '@types';
import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [tree, setTree] = useState<TreeNode[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/tree`, {
      method: 'GET',
    }).then(resp => resp.json().then(value => setTree(value as TreeNode[])));
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Tree View Example</h1>
      {tree && <Tree data={tree} />}
    </div>
  );
};

export default App;
