'use client';

import { PostGraph, PostGraphLink, PostGraphNode } from '@types';
import classNames from 'classnames';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceSimulation,
  forceX,
  forceY,
} from 'd3-force';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { useEffect, useMemo, useState } from 'react';

const ForceDirectedGraph = ({
  postGraph,
  scale = 1,
  height = 600,
  width = 600,
  className,
}: {
  postGraph: PostGraph;
  scale?: number;
  height?: number;
  width?: number;
  className?: string;
}) => {
  const { color, r } = useMemo(
    () => ({
      // Specify the color scale.
      color: scaleOrdinal(schemeCategory10),
      r: 8,
    }),
    [],
  );
  const [simulationNodes, setSimulationNodes] = useState<PostGraphNode[]>([]);
  const [simulationLinks, setSimulationLinks] = useState<PostGraphLink[]>([]);
  const [hoveredNode, setHoveredNode] = useState<PostGraphNode>();

  const isNodeHovered = (node: PostGraphNode) => {
    return hoveredNode?.wikilink === node.wikilink;
  };

  const isHoveredNodeLink = (source: PostGraphNode, target: PostGraphNode) => {
    return (
      source.wikilink === hoveredNode?.wikilink ||
      target.wikilink === hoveredNode?.wikilink
    );
  };

  useEffect(() => {
    const forceLinkWithNodes = forceLink<PostGraphNode, PostGraphLink>(
      postGraph.links,
    ).id(d => d.wikilink);

    const simulation = forceSimulation<PostGraphNode>(postGraph.nodes)
      .force('link', forceLinkWithNodes)
      .force('x', forceX(width / 2))
      .force('y', forceY(height / 2))
      .force(
        'collide',
        forceCollide(
          (scale * Math.min(width, height)) / (postGraph.nodes.length + 1),
        ),
      )
      .force('center', forceCenter(width / 2, height / 2));

    simulation.on('tick', () => {
      setSimulationNodes([...simulation.nodes()]);
      setSimulationLinks([...forceLinkWithNodes.links()]);
    });

    return () => simulation.stop() as unknown as void;
  }, []);

  return (
    <svg
      className={classNames('max-w-full', className)}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <g>
        <defs>
          <marker
            id="arrow"
            markerHeight="10"
            markerUnits="strokeWidth"
            markerWidth="10"
            orient="auto"
            refX="22"
            refY="6"
            viewBox="0 0 12 12"
          >
            <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="grey"></path>
          </marker>
        </defs>
        {simulationLinks.map(({ source, target, index }) => {
          const sourceNode = source as PostGraphNode;
          const targetNode = target as PostGraphNode;
          return (
            <line
              key={index}
              markerEnd="url(#arrow)"
              strokeWidth={0.8}
              stroke={
                isHoveredNodeLink(sourceNode, targetNode) ? '#30abf1' : 'grey'
              }
              x1={sourceNode.x}
              x2={targetNode.x}
              y1={sourceNode.y}
              y2={targetNode.y}
            />
          );
        })}
      </g>
      <g stroke="#fff" strokeWidth={1.5}>
        {simulationNodes.map(node => {
          const fillColor = color(node.slugIdx!.toString());
          return (
            <g
              key={node.wikilink}
              transform={` translate(${node.x}, ${node.y}) `}
              onMouseOver={() => setHoveredNode({ ...node })}
              onMouseOut={() => setHoveredNode(undefined)}
            >
              <circle
                r={r}
                style={{
                  fill: fillColor,
                  transform: isNodeHovered(node) ? 'scale(1.1)' : 'none',
                  transitionProperty: 'transform',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDuration: '150ms',
                }}
              />
              <text
                dy={r * 2 + 2}
                style={{
                  fontSize: '10px',
                  strokeWidth: 0,
                }}
                textAnchor="middle"
                className={classNames(
                  {
                    'translate-y-1': isNodeHovered(node),
                  },
                  'transition ease-in-out',
                )}
              >
                {node.title}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export default ForceDirectedGraph;
