'use client';

import { PostGraph, PostGraphLink, PostGraphNode } from '@types';
import styles from '@utils/forceGraph.module.css';
import { runForceGraph } from '@utils/forceGraphGenerator';
import classNames from 'classnames';

import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

const HOVERED_COLOR = '#30abf1';
const DEFAULT_COLOR = 'grey';
const DEFAULT_REPULSIVE_FORCE = -100;

const ForceDirectedGraph = ({
  postGraph,
  scale = 1,
  height = 300,
  width = 300,
  className,
  basePostWikilinks = [],
}: {
  postGraph: PostGraph;
  scale?: number;
  height?: number;
  width?: number;
  className?: string;
  basePostWikilinks?: string[];
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
  const [hoveredNode, setHoveredNode] = useState<PostGraphNode | null>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const onMountRef = useRef<boolean>(true);

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
    if (containerRef.current && onMountRef.current) {
      runForceGraph(containerRef.current, postGraph.links, postGraph.nodes);
    }

    onMountRef.current = false;
  }, [onMountRef.current]);

  // useEffect(() => {
  //   if (!nodeGroupRef.current) {
  //     return () => {};
  //   }

  //   const forceLinkWithNodes = forceLink<PostGraphNode, PostGraphLink>(
  //     postGraph.links,
  //   )
  //     .id(d => d.wikilink)
  //     .distance(50);

  //   const simulation = forceSimulation<PostGraphNode>(postGraph.nodes)
  //     .force('link', forceLinkWithNodes)
  //     .force('charge', forceManyBody().strength(DEFAULT_REPULSIVE_FORCE))
  //     // Force nodes to be displayed in the center of the graph.
  //     .force('center', forceCenter(width / 2, height / 2));

  //   const nodes = select(nodeGroupRef.current)
  //     .selectAll('g')
  //     .data(postGraph.nodes)
  //     .enter()
  //     .append('g');

  //   const node = nodes
  //     .append('circle')
  //     .attr('r', r)
  //     .attr('fill', DEFAULT_COLOR);

  //   // Make graph scalable.
  //   const svg = select<Element, any>('#postGraph');
  //   const zoomBehavior = zoom()
  //     .scaleExtent([0.5, 3])
  //     .translateExtent([
  //       [0, 0],
  //       [width, height],
  //     ])
  //     .on('zoom', event => {
  //       const zoomState = event.transform;
  //       select('#linkGroup').attr('transform', zoomState);
  //       select('#nodeGroup').attr('transform', zoomState);
  //     });
  //   svg.call(zoomBehavior);

  //   // Make graph draggable.
  //   // const nodes = select<Element, any>('#nodeGroup').selectAll('g');
  //   const dragBehavior = drag()
  //     .on('start', function (this, event) {
  //       if (!event.active) {
  //         simulation.alphaTarget(0.3).restart();
  //       }
  //       event.subject.fx = event.subject.x;
  //       event.subject.fy = event.subject.y;
  //     })
  //     .on('drag', function (this, event) {
  //       event.subject.fx = event.subject.x;
  //       event.subject.fy = event.subject.y;
  //     })
  //     .on('end', event => {
  //       if (!event.active) {
  //         simulation.alphaTarget(0);
  //       }
  //       event.subject.fx = null;
  //       event.subject.fy = null;
  //     });
  //   // @ts-ignore
  //   // nodes.call(dragBehavior);

  //   simulation.on('tick', () => {
  //     // link
  //     //   .attr('x1', (d: any) => d.source.x)
  //     //   .attr('y1', (d: any) => d.source.y)
  //     //   .attr('x2', (d: any) => d.target.x)
  //     //   .attr('y2', (d: any) => d.target.y);
  //     node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
  //   });

  //   return () => {
  //     simulation.stop();
  //   };
  // }, [nodeGroupRef.current]);

  // useEffect(() => {
  //   const svgEl = svgRef.current;
  //   const onWheelHandler = (e: WheelEvent) => {
  //     e.preventDefault();
  //   };

  //   if (svgEl) {
  //     svgEl.addEventListener('wheel', onWheelHandler, { passive: false });
  //   }

  //   return () => {
  //     if (svgEl) {
  //       svgEl.removeEventListener('wheel', onWheelHandler);
  //     }
  //   };
  // }, [svgRef.current]);

  return (
    <div
      ref={containerRef}
      className={classNames('max-w-full', className, styles.container)}
    >
      {/* <div className="font-bold">Graph View</div>
      <svg
        id="postGraph"
        className="border-1 rounded"
        height={height}
        width={width}
        viewBox={`0 0 ${width} ${height}`}
        ref={svgRef}
      > */}
      {/* <g id="linkGroup">
          {simulationLinks.map(({ source, target, index }) => {
            const sourceNode = source as PostGraphNode;
            const targetNode = target as PostGraphNode;
            return (
              <line
                key={index}
                strokeWidth={0.5}
                stroke={
                  isHoveredNodeLink(sourceNode, targetNode)
                    ? HOVERED_COLOR
                    : 'grey'
                }
                x1={sourceNode.x}
                x2={targetNode.x}
                y1={sourceNode.y}
                y2={targetNode.y}
              />
            );
          })}
        </g> */}
      {/* <g ref={nodeGroupRef} /> */}
      {/* <g id="nodeGroup" stroke="#fff" strokeWidth={0.5}> */}
      {/* {simulationNodes.map(node => {
          const nodeHovered = isNodeHovered(node);
          return (
            <g
              key={node.wikilink}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseOver={() => setHoveredNode({ ...node })}
              onMouseOut={() => setHoveredNode(null)}
              onClick={() => {
                router.push(`/${node.wikilink}`);
              }}
            >
              <circle
                r={r}
                style={{
                  fill: nodeHovered ? HOVERED_COLOR : 'grey',
                  transform: nodeHovered ? 'scale(1.2)' : 'none',
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
                    'translate-y-1': nodeHovered,
                  },
                  'transition-all ease-in-out',
                  {
                    underline: basePostWikilinks.includes(node.wikilink),
                  },
                  {
                    'opacity-0': !nodeHovered,
                    'opacity-100': nodeHovered,
                    visible: nodeHovered,
                    invisible: !nodeHovered,
                  },
                )}
              >
                {node.title}
              </text>
            </g>
          );
        })} */}
      {/* </g> */}
      {/* </svg> */}
    </div>
  );
};

export default ForceDirectedGraph;
