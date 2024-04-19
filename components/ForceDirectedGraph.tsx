'use client';

import { PostGraph, PostGraphLink, PostGraphNode } from '@types';
import classNames from 'classnames';
import * as d3 from 'd3';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

// color(gray-400 from tailwindcss) of node and link
const COLOR = '#9ca3af';

// tailwindcss zinc-600
const HIGHLIGHT_COLOR = '#52525b';

const REPULSIVE_FORCE = -5;

const LINK_DISTANCE = 50;

const LINE_WIDTH = 0.5;

const HIGHLIGHT_LINE_WIDTH = 1;

const DURATION = 100;

const BASE_RADIUS = 6;

const OPACITY_SCALE = 1;

const calcNodeRadius = (node: PostGraphNode) =>
  BASE_RADIUS + Math.sqrt(node.backlinks.length);

const ForceDirectedGraph = ({
  postGraph,
  size = 300,
  className,
  postId,
  border = true,
  full = false,
}: {
  postGraph: PostGraph;
  size?: number;
  className?: string;
  postId?: string;
  border?: boolean;
  full?: boolean;
}) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const onMountRef = useRef<boolean>(true);
  const scaledOpacityRef = useRef<number>(0);

  useEffect(() => {
    const { links, nodes } = postGraph;

    const drag = (simulation: d3.Simulation<PostGraphNode, PostGraphLink>) => {
      const dragstarted = (event: any, d: any) => {
        if (!event.active) {
          simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      };

      const dragged = (event: any, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      };

      const dragended = (event: any, d: any) => {
        if (!event.active) {
          simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      };

      return d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    };

    // use `onMountRef` to make useEffect only renders once in develop mode
    if (containerRef.current && onMountRef.current) {
      const simulation = d3
        .forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(REPULSIVE_FORCE))
        .force(
          'link',
          d3
            .forceLink<PostGraphNode, PostGraphLink>(links)
            .id(d => d.id)
            .strength(0.1)
            .distance(LINK_DISTANCE),
        )
        .force('center', d3.forceCenter(size / 2, size / 2));

      // create svg element and make it scalable
      const svg = d3
        .select(containerRef.current)
        .append('svg')
        .attr('viewBox', [0, 0, size, size])
        .call(
          d3
            .zoom<SVGSVGElement, any>()
            .extent([
              [0, 0],
              [size, size],
            ])
            .scaleExtent([0.25, 4])
            .on('zoom', ({ transform }) => {
              // make svg move silkily
              link.attr('transform', transform);
              node.attr('transform', transform);
              const scale = transform.k * OPACITY_SCALE;
              const scaledOpacity = Math.max((scale - 1) / 1.5, 0);
              scaledOpacityRef.current = scaledOpacity;
              title
                .attr('transform', transform)
                .style('opacity', scaledOpacity)
                .style('visibility', scaledOpacity > 0 ? 'visible' : 'hidden');
            }),
        );

      // create links
      const link = svg
        .append('g')
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('class', 'link')
        .attr('stroke', COLOR)
        .attr('stroke-width', LINE_WIDTH);

      // create nodes
      const node = svg
        .append('g')
        .selectAll('circle')
        .data(nodes)
        .join('circle')
        .attr('class', 'node')
        .attr('r', r => calcNodeRadius(r))
        .attr('fill', COLOR)
        .style('cursor', 'pointer')
        .on('click', (_, d) => {
          router.push('/posts/' + d.id);
        })
        .on('mouseover', function (_, d) {
          const { id } = d;
          const link = d3.selectAll<HTMLElement, PostGraphLink>('.link');
          const node = d3.selectAll<HTMLElement, PostGraphNode>('.node');
          const title = d3.selectAll<HTMLElement, PostGraphNode>('.title');

          const connectedNodeIds = [...d.backlinks, ...d.forwardLinks];
          const connectedLinks = link.filter(d => {
            const source = d.source as PostGraphNode;
            const target = d.target as PostGraphNode;
            return id === source.id || id === target.id;
          });

          // fade out not connected links and nodes
          link
            .filter(d => {
              const source = d.source as PostGraphNode;
              const target = d.target as PostGraphNode;
              return !(id === source.id || id === target.id);
            })
            .transition()
            .duration(DURATION)
            .style('opacity', 0.2)
            .attr('stroke', COLOR)
            .attr('stroke-width', LINE_WIDTH);
          node
            .filter(d => !connectedNodeIds.includes(d.id))
            .filter(d => d.id !== id)
            .transition()
            .duration(DURATION)
            .style('opacity', 0.2);

          // highlight connected links
          connectedLinks
            .transition()
            .duration(DURATION)
            .attr('stroke', HIGHLIGHT_COLOR)
            .attr('stroke-width', HIGHLIGHT_LINE_WIDTH);

          // highlight self
          d3.select(this)
            .transition()
            .duration(DURATION)
            .attr('fill', HIGHLIGHT_COLOR);

          // show title
          title
            .filter(d => d.id === id)
            .transition()
            .duration(DURATION)
            .style('visibility', 'visible')
            .style('opacity', 1);
        })
        .on('mouseleave', function (_, d) {
          const { id } = d;
          const link = d3.selectAll<HTMLElement, PostGraphLink>('.link');
          const node = d3.selectAll<HTMLElement, PostGraphNode>('.node');
          const title = d3.selectAll<HTMLElement, PostGraphNode>('.title');

          // recover all links and nodes
          link
            .transition()
            .duration(DURATION)
            .style('opacity', 1)
            .attr('stroke', COLOR)
            .attr('stroke-width', LINE_WIDTH);

          let toBeRecoveredNode = node;
          if (postId) {
            toBeRecoveredNode = node.filter(d => d.id !== postId);
          }
          toBeRecoveredNode
            .transition()
            .duration(DURATION)
            .style('opacity', 1)
            .attr('fill', COLOR);

          // hide title
          title
            .filter(d => d.id === id)
            .transition()
            .duration(DURATION)
            .style(
              'visibility',
              scaledOpacityRef.current > 0 ? 'visible' : 'hidden',
            )
            .style('opacity', scaledOpacityRef.current);
        })
        // @ts-ignore
        .call(drag(simulation));

      // create titles
      const title = svg
        .append('g')
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('class', 'title')
        .attr('dx', 0)
        .attr('dy', r => calcNodeRadius(r) * -2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('font-size', '10px')
        .style('stroke-width', 0)
        .style('opacity', 0)
        .style('visibility', 'hidden')
        .style('cursor', 'pointer')
        .text(d => d.title!)
        .on('click', (_, d) => {
          router.push('/posts/' + d.id);
        })
        // @ts-ignore
        .call(drag(simulation));

      if (postId) {
        node.filter(d => d.id === postId).attr('fill', HIGHLIGHT_COLOR);
      }

      simulation.on('tick', () => {
        //update link positions
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        // update node positions
        node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);

        // update title positions
        title.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);
      });
    }

    onMountRef.current = false;
  });

  return (
    <div
      ref={containerRef}
      className={classNames(
        className,
        { 'border-1': border },
        'rounded-md',
        'mt-3',
      )}
      style={
        full
          ? {
              width: '100%',
              height: '100%',
            }
          : {
              width: size,
              height: size,
            }
      }
    />
  );
};

export default ForceDirectedGraph;
