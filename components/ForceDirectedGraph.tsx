'use client';

import { PostGraph, PostGraphLink, PostGraphNode } from '@types';
import * as d3 from 'd3';
import { useLayoutEffect, useRef } from 'react';

export default function ForceDirectedGraph({
  postGraph,
  size = 300,
}: {
  postGraph: PostGraph;
  size?: number;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useLayoutEffect(() => {
    function nodeRadius(d: PostGraphNode) {
      const numLinks = links.filter(
        (l: any) =>
          l.source.wikilink === d.wikilink || l.target.wikilink === d.wikilink,
      ).length;
      console.log(links, d);
      return 2 + Math.sqrt(numLinks);
    }

    const width = size;
    const height = size;

    const links = postGraph.links;
    const nodes = postGraph.nodes;

    const simulation = d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody())
      .force(
        'link',
        d3
          .forceLink<PostGraphNode, PostGraphLink>(links)
          .id(d => d.wikilink)
          .distance(50),
      )
      .force('center', d3.forceCenter(width / 2, height / 2));

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    const everything = svg.selectAll('*');
    everything.remove();

    const link = svg
      .append('g')
      .attr('stroke', 'grey')
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
      .attr('r', nodeRadius)
      .attr('fill', 'grey');

    node.append('title').text(d => d.title);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
    });

    svg.call(
      // @ts-ignore
      d3
        .zoom<Element, any>()
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

    node.call(
      // @ts-ignore
      d3
        .drag<Element, PostGraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended),
    );

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragstarted(event: any) {
      if (!event.active) {
        simulation.alphaTarget(1).restart();
      }
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragended(event: any) {
      if (!event.active) {
        simulation.alphaTarget(0);
      }
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, []);

  return (
    <div>
      <svg ref={svgRef} />
    </div>
  );
}
