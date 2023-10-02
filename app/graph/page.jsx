'use client';

import useSWR from 'swr';
import { useEffect, useMemo, useRef } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force';
import { select } from 'd3-selection';
import fetcher from '../api/fetcher';
import LgSpinnerInCenter from '../../components/LgSpinnerInCenter';

export default function ForceDirectedGraph() {
  const { data, error, isLoading } = useSWR('/api/post/graph', fetcher);
  const svgRef = useRef(null);

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

  useEffect(() => {
    if (!data) {
      return;
    }

    const nodes = data.nodes.map(d => ({ ...d }));
    const links = data.links.map(d => ({ ...d }));

    const simulation = forceSimulation(nodes)
      .force(
        'link',
        forceLink(links).id(d => d.wikilink),
      )
      .force('charge', forceManyBody())
      .force('center', forceCenter(width / 2, height / 2));

    const svg = select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    const everything = svg.selectAll('*');
    everything.remove();

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll()
      .data(links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(1));

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll()
      .data(nodes)
      .join('circle')
      .attr('r', 8)
      .attr('fill', d => color(d.slugIdx));

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('cx', d => d.x).attr('cy', d => d.y);
    });

    node.append('title').text(d => d.title);

    return () => simulation.stop();
  }, [data, svgRef.current]);

  if (error) {
    return <div>failed to load</div>;
  }

  if (isLoading) {
    return <LgSpinnerInCenter />;
  }

  return <svg ref={svgRef} />;
}
