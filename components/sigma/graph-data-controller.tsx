'use client';

import { useSigma } from '@react-sigma/core';
import { FC, PropsWithChildren, useEffect } from 'react';
import { FiltersState } from './types';

const GraphDataController: FC<PropsWithChildren<{ filters: FiltersState }>> = ({
  filters,
  children,
}) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  useEffect(() => {
    const { tags } = filters;
    graph.forEachNode((node, { tags: nodeTags }) => {
      // TODO: control whether to enable tag filter function
      if (nodeTags) {
        graph.setNodeAttribute(
          node,
          'hidden',
          (nodeTags as string[]).findIndex(t => tags[t]) === -1,
        );
      }
    });
  }, [graph, filters]);

  return <>{children}</>;
};

export default GraphDataController;
