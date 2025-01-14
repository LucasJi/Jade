'use client';

import { FC, useEffect, useState } from 'react';

import { getGraphDataset } from '@/app/api';
import { getSimpleFilename, mapPathsToColors } from '@/lib/file';
import {
  useLoadGraph,
  useRegisterEvents,
  useSetSettings,
  useSigma,
} from '@react-sigma/core';
import { useLayoutCircular } from '@react-sigma/layout-circular';
import { useLayoutForceAtlas2 } from '@react-sigma/layout-forceatlas2';
import { DirectedGraph } from 'graphology';
import { max, min } from 'lodash';
import { EdgeType, NodeType, useRandom } from './use-random';

export const SampleGraph: FC<{ disableHoverEffect?: boolean }> = ({
  disableHoverEffect,
}) => {
  const { randomGraph } = useRandom();
  const sigma = useSigma<NodeType, EdgeType>();
  const registerEvents = useRegisterEvents<NodeType, EdgeType>();
  const setSettings = useSetSettings<NodeType, EdgeType>();
  const loadGraph = useLoadGraph();
  const { assign: assignForceAtlas2 } = useLayoutForceAtlas2();
  const { assign: assignCircular } = useLayoutCircular();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  /**
   * When component mount
   * => load the graph
   */
  useEffect(() => {
    getGraphDataset().then(data => {
      const graph = new DirectedGraph();
      const targetCount: Record<string, number> = {};
      const paths: string[] = [];

      data.forEach((d: any) => {
        d.targets.forEach((target: string) => {
          if (target in targetCount) {
            targetCount[target] = targetCount[target] + 1;
          } else {
            targetCount[target] = 1;
          }
        });

        paths.push(d.node);
      });

      const colorMap = mapPathsToColors(paths);

      data.forEach((d: any) => {
        graph.addNode(d.node, {
          label: getSimpleFilename(d.node),
          // [4,20]
          size: min([20, max([4, targetCount[d.node] * 1.5])]),
          color: colorMap[d.node],
          x: Math.random(),
          y: Math.random(),
        });
      });

      data.forEach((d: any) => {
        d.targets.forEach((target: string) => {
          graph.addEdge(d.node, target);
        });
      });

      // Create & load the graph
      console.log('Graph is ', graph.toJSON());
      loadGraph(graph);
      assignCircular();
      assignForceAtlas2();

      // Register the events
      registerEvents({
        enterNode: event => setHoveredNode(event.node),
        leaveNode: () => setHoveredNode(null),
      });
    });
  }, [assignCircular, loadGraph, registerEvents, randomGraph]);

  /**
   * When component mount or hovered node change
   * => Setting the sigma reducers
   */
  useEffect(() => {
    setSettings({
      nodeReducer: (node, data) => {
        const graph = sigma.getGraph();
        const newData = { ...data, highlighted: data.highlighted || false };

        if (!disableHoverEffect && hoveredNode) {
          if (
            node === hoveredNode ||
            graph.neighbors(hoveredNode).includes(node)
          ) {
            newData.highlighted = true;
          } else {
            newData.color = '#E2E2E2';
            newData.highlighted = false;
          }
        }
        return newData;
      },
      edgeReducer: (edge, data) => {
        const graph = sigma.getGraph();
        const newData = { ...data, hidden: false };

        if (
          !disableHoverEffect &&
          hoveredNode &&
          !graph.extremities(edge).includes(hoveredNode)
        ) {
          newData.hidden = true;
        }
        return newData;
      },
    });
  }, [hoveredNode, setSettings, sigma, disableHoverEffect]);

  return null;
};
