'use client';

import { FC, useCallback, useEffect, useState } from 'react';

import { getGraph } from '@/app/api';
import {
  useLoadGraph,
  useRegisterEvents,
  useSetSettings,
  useSigma,
} from '@react-sigma/core';
import { useLayoutCircular } from '@react-sigma/layout-circular';
import { DirectedGraph } from 'graphology';
import { EdgeType, NodeType, useRandom } from './use-random';

export const SampleGraph: FC<{ disableHoverEffect?: boolean }> = ({
  disableHoverEffect,
}) => {
  const { randomGraph } = useRandom();
  const sigma = useSigma<NodeType, EdgeType>();
  const registerEvents = useRegisterEvents<NodeType, EdgeType>();
  const setSettings = useSetSettings<NodeType, EdgeType>();
  const loadGraph = useLoadGraph();
  const { assign: assignCircular } = useLayoutCircular();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const randomColor = useCallback(() => {
    const digits = '0123456789abcdef';
    let code = '#';
    for (let i = 0; i < 6; i++) {
      code += digits.charAt(Math.floor(Math.random() * 16));
    }
    return code;
  }, []);

  /**
   * When component mount
   * => load the graph
   */
  useEffect(() => {
    getGraph().then(data => {
      const graph = new DirectedGraph();

      data.forEach((d: any) => {
        graph.addNode(d.node, {
          label: d.node,
          size: 4,
          color: randomColor(),
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
