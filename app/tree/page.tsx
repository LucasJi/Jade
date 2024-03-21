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
          children: [
            {
              id: 7,
              name: 'Node 1.2.1',
            },
            {
              id: 8,
              name: 'Node 1.2.2',
              children: [
                {
                  id: 9,
                  name: 'Node 1.2.2.1',
                },
                {
                  id: 10,
                  name: 'Node 1.2.2.2',
                  children: [
                    {
                      id: 11,
                      name: 'Node 1.2.2.2.1',
                    },
                    {
                      id: 12,
                      name: 'Node 1.2.2.2.2',
                      children: [
                        {
                          id: 13,
                          name: 'Node 1.2.2.2.2.1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                        },
                        {
                          id: 14,
                          name: 'Node 1.2.2.2.2.2',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
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
