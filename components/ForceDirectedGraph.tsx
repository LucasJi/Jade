'use client';

import { PostGraph, PostGraphLink, PostGraphNode } from '@types';
import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

const HOVERED_COLOR = '#30abf1';

export default function ForceDirectedGraph({
  postGraph,
  scale = 1,
  size = 300,
  className,
  basePostWikilinks = [],
}: {
  postGraph: PostGraph;
  scale?: number;
  size?: number;
  className?: string;
  basePostWikilinks?: string[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Specify the dimensions of the chart.
    const width = size;
    const height = size;

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = postGraph.links;
    const nodes = postGraph.nodes;

    // Create a simulation with several forces.
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink<PostGraphNode, PostGraphLink>(links).id(d => d.wikilink),
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', ticked);

    // Create the SVG container.
    const svg = d3
      .select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: 100%;');

    // Add a line for each link, and a circle for each node.
    const link = svg
      .append('g')
      .attr('stroke', HOVERED_COLOR)
      .attr('stroke-opacity', 0.6)
      .selectAll()
      .data(links)
      .join('line')
      .attr('stroke-width', 0.8);

    const node = svg
      .append('g')
      .attr('stroke-width', 1.5)
      .selectAll()
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', d => color(d.slugIdx!.toString()));

    node.append('title').text(d => d.title);

    svg.call(
      d3
        .zoom<SVGSVGElement, any>()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([0.25, 4])
        .on('zoom', ({ transform }) => {
          link.attr('transform', transform);
          node.attr('transform', transform);
        }),
    );

    // Add a drag behavior.
    node.call(
      // @ts-ignore
      d3
        .drag<Element, PostGraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended),
    );

    // Set the position attributes of links and nodes each time the simulation ticks.
    function ticked() {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
    }

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event: any, d: PostGraphNode) {
      if (!event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event: any, d: PostGraphNode) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event: any, d: PostGraphNode) {
      if (!event.active) {
        simulation.alphaTarget(0);
      }
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // containerRef.current = svg.node()!;
    return () => {
      simulation.stop();
    };
  }, []);

  return <div ref={containerRef} />;
  // const { color, r } = useMemo(
  //   () => ({
  //     // Specify the color scale.
  //     color: scaleOrdinal(schemeCategory10),
  //     r: 8,
  //   }),
  //   [],
  // );
  // const [simulationNodes, setSimulationNodes] = useState<PostGraphNode[]>([]);
  // const [simulationLinks, setSimulationLinks] = useState<PostGraphLink[]>([]);
  // const [hoveredNode, setHoveredNode] = useState<PostGraphNode>();
  // const router = useRouter();
  // const svgRef = useRef<SVGSVGElement>(null);
  // const isNodeHovered = (node: PostGraphNode) => {
  //   return hoveredNode?.wikilink === node.wikilink;
  // };
  // const isHoveredNodeLink = (source: PostGraphNode, target: PostGraphNode) => {
  //   return (
  //     source.wikilink === hoveredNode?.wikilink ||
  //     target.wikilink === hoveredNode?.wikilink
  //   );
  // };
  // useEffect(() => {
  //   const forceLinkWithNodes = forceLink<PostGraphNode, PostGraphLink>(
  //     postGraph.links,
  //   ).id(d => d.wikilink);
  //   const simulation = forceSimulation<PostGraphNode>(postGraph.nodes)
  //     .force('charge', forceManyBody().strength(-100 * 0.5))
  //     .force('link', forceLinkWithNodes)
  //     // .force('x', forceX(size / 2))
  //     // .force('y', forceY(size / 2))
  //     // .force(
  //     //   'collide',
  //     //   forceCollide(
  //     //     (scale * Math.min(size, size)) / (postGraph.nodes.length + 1),
  //     //   ),
  //     // )
  //     // Force nodes to be displayed in the center of the graph.
  //     .force('center', forceCenter(size / 2, size / 2).strength(0.3));
  //   simulation.on('tick', () => {
  //     setSimulationNodes([...simulation.nodes()]);
  //     setSimulationLinks([...forceLinkWithNodes.links()]);
  //   });
  //   const svg = select<Element, unknown>('#postGraph');
  //   const zoomBehavior = zoom()
  //     .scaleExtent([0.5, 3])
  //     .translateExtent([
  //       [0, 0],
  //       [size, size],
  //     ])
  //     .on('zoom', event => {
  //       const zoomState = event.transform;
  //       select('#linkGroup').attr('transform', zoomState);
  //       select('#nodeGroup').attr('transform', zoomState);
  //     });
  //   svg.call(zoomBehavior);
  //   return () => {
  //     simulation.stop();
  //   };
  // }, [postGraph]);
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
  // return (
  //   <div className={classNames('max-w-full', className)}>
  //     <div className="font-bold">Graph View</div>
  //     <svg
  //       id="postGraph"
  //       className="border-1 rounded"
  //       height={size}
  //       viewBox={`0 0 ${size} ${size}`}
  //       width={size}
  //       ref={svgRef}
  //     >
  //       <g id="linkGroup">
  //         {simulationLinks.map(({ source, target, index }) => {
  //           const sourceNode = source as PostGraphNode;
  //           const targetNode = target as PostGraphNode;
  //           return (
  //             <line
  //               key={index}
  //               strokeWidth={0.8}
  //               stroke={
  //                 isHoveredNodeLink(sourceNode, targetNode)
  //                   ? HOVERED_COLOR
  //                   : 'grey'
  //               }
  //               x1={sourceNode.x}
  //               x2={targetNode.x}
  //               y1={sourceNode.y}
  //               y2={targetNode.y}
  //             />
  //           );
  //         })}
  //       </g>
  //       <g stroke="#fff" strokeWidth={1.5} id="nodeGroup">
  //         {simulationNodes.map(node => {
  //           const fillColor = color(node.slugIdx!.toString());
  //           const nodeHovered = isNodeHovered(node);
  //           return (
  //             <g
  //               key={node.wikilink}
  //               transform={` translate(${node.x}, ${node.y}) `}
  //               onMouseOver={() => setHoveredNode({ ...node })}
  //               onMouseOut={() => setHoveredNode(undefined)}
  //               onClick={() => {
  //                 router.push(`/${node.wikilink}`);
  //               }}
  //             >
  //               <circle
  //                 r={r}
  //                 style={{
  //                   fill: nodeHovered ? HOVERED_COLOR : 'grey',
  //                   transform: nodeHovered ? 'scale(1.1)' : 'none',
  //                   transitionProperty: 'transform',
  //                   transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  //                   transitionDuration: '150ms',
  //                 }}
  //               />
  //               <text
  //                 dy={r * 2 + 2}
  //                 style={{
  //                   fontSize: '10px',
  //                   strokeWidth: 0,
  //                 }}
  //                 textAnchor="middle"
  //                 className={classNames(
  //                   {
  //                     'translate-y-1': nodeHovered,
  //                   },
  //                   'transition ease-in-out',
  //                   {
  //                     underline: basePostWikilinks.includes(node.wikilink),
  //                   },
  //                 )}
  //               >
  //                 {node.title}
  //               </text>
  //             </g>
  //           );
  //         })}
  //       </g>
  //     </svg>
  //   </div>
  // );
}
