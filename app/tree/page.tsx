'use client';
import Tree from '@components/Tree';
import React from 'react';

const App: React.FC = () => {
  const treeData = [
    {
      id: 1,
      name: 'Node 1',
      children: [
        {
          id: 2,
          name: 'Node 1.1',
          children: [
            {
              id: 3,
              name: 'Node 1.1.1',
            },
            {
              id: 4,
              name: 'Node 1.1.2',
            },
          ],
        },
        {
          id: 5,
          name: 'Node 1.2',
        },
      ],
    },
    {
      id: 6,
      name: 'Node 2',
    },
  ];

  return (
    <div className="flex flex-col justify-center items-center">
      <h1>Tree View Example</h1>
      <Tree data={treeData} />
    </div>
  );
};

export default App;
