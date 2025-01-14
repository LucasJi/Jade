'use client';

import { useSigma } from '@react-sigma/core';
import { circular } from 'graphology-layout';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { keyBy } from 'lodash';
import { FC, PropsWithChildren, useEffect } from 'react';
import { Dataset, FiltersState, Tag } from './types';

const GraphDataController: FC<
  PropsWithChildren<{ dataset: Dataset; filters: FiltersState }>
> = ({ dataset, filters, children }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  console.log(filters);

  /**
   * Feed graphology with the new dataset:
   */
  useEffect(() => {
    if (!graph || !dataset) {
      return;
    }

    const tags = keyBy(dataset.tags, 'key');

    dataset.nodes.forEach(node =>
      graph.addNode(node.key, {
        ...node,
        size: 6,
      }),
    );
    dataset.edges.forEach(([source, target]) =>
      graph.addEdge(source, target, { size: 1 }),
    );

    circular.assign(graph);
    forceAtlas2.assign(graph, {
      iterations: 5,
      settings: {
        gravity: 0.5,
        linLogMode: true,
      },
    });

    return () => graph.clear();
  }, [graph, dataset]);

  /**
   * Apply filters to graphology:
   */
  useEffect(() => {
    const { tags } = filters;
    graph.forEachNode((node, { tags: nodeTags }) => {
      if (nodeTags) {
        graph.setNodeAttribute(
          node,
          'hidden',
          (nodeTags as Tag[]).findIndex(nt => tags[nt.key]) !== -1,
        );
      }
    });
  }, [graph, filters]);

  return <>{children}</>;
};

export default GraphDataController;
