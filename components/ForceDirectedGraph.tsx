'use client';

import { useEffect, useMemo, useState } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force';
import { PostGraph, PostGraphLink, PostGraphNode } from '@types';

const ForceDirectedGraph = ({ postGraph }: { postGraph: PostGraph }) => {
  const { width, height, color } = useMemo(
    () => ({
      // Specify the dimensions of the chart.
      width: 900,
      height: 600,
      // Specify the color scale.
      color: scaleOrdinal(schemeCategory10),
    }),
    [],
  );
  const [simulationNodes, setSimulationNodes] = useState<PostGraphNode[]>([]);
  const [simulationLinks, setSimulationLinks] = useState<PostGraphLink[]>([]);

  useEffect(() => {
    const forceLinkWithNodes = forceLink<PostGraphNode, PostGraphLink>(
      postGraph.links,
    ).id(d => d.wikilink);

    const simulation = forceSimulation<PostGraphNode>(postGraph.nodes)
      .force('link', forceLinkWithNodes)
      .force('charge', forceManyBody())
      .force('center', forceCenter(width / 2, height / 2));

    simulation.on('tick', () => {
      setSimulationNodes([...simulation.nodes()]);
      setSimulationLinks([...forceLinkWithNodes.links()]);
    });

    return () => simulation.stop() as unknown as void;
  }, []);

  return (
    <svg
      className="max-w-full h-auto"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <g stroke="#999" strokeOpacity={0.8}>
        {simulationLinks.map(({ source, target, index }) => {
          const sourceNode = source as PostGraphNode;
          const targetNode = target as PostGraphNode;
          return (
            <line
              key={index}
              strokeWidth={1}
              x1={sourceNode.x}
              x2={targetNode.x}
              y1={sourceNode.y}
              y2={targetNode.y}
            />
          );
        })}
      </g>
      <g stroke="#fff" strokeWidth={1.5}>
        {simulationNodes.map(node => (
          <circle
            cx={node.x}
            cy={node.y}
            fill={color(node.slugIdx!.toString())}
            key={node.wikilink}
            r={8}
          />
        ))}
      </g>
    </svg>
  );
};

export default ForceDirectedGraph;
