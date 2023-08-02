//useSWR allows the use of SWR inside function components
import useSWR from 'swr';
import { useLayoutEffect, useRef, useState } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';

const fetcher = url => fetch(url).then(res => res.json());
export default function ForceDirectedGraph() {
  const { data, error, isLoading } = useSWR('/api/testdata', fetcher);
  const linkRef = useRef();
  const svgRef = useRef();
  const [links, setLinks] = useState([]);
  const [nodes, setNodes] = useState([]);

  // Specify the dimensions of the chart.
  const width = 928;
  const height = 600;

  // Specify the color scale.
  const color = scaleOrdinal(schemeCategory10);

  useLayoutEffect(() => {
    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    if (data) {
      setNodes(data.nodes.map(d => ({ ...d })));
      setLinks(data.links.map(d => ({ ...d })));
    }
  }, [data]);

  // Create a simulation with several forces.
  const simulation = forceSimulation(nodes)
    .force(
      'link',
      forceLink(links).id(d => d.id),
    )
    .force('charge', forceManyBody())
    .force('center', forceCenter(width / 2, height / 2))
    .on('tick', ticked);

  console.log('nodes:', nodes);
  console.log('links:', links);

  const svg = select(svgRef.current);

  // Add a line for each link, and a circle for each node.
  const link = svg
    .append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll()
    .data(links)
    .join('line')
    .attr('stroke-width', d => Math.sqrt(d.value));

  const node = svg
    .append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .selectAll()
    .data(nodes)
    .join('circle')
    .attr('r', 5)
    .attr('fill', d => color(d.group));

  node.append('title').text(d => d.name);

  // Add a drag behavior.
  node.call(
    drag().on('start', dragstarted).on('drag', dragged).on('end', dragended),
  );

  // Set the position attributes of links and nodes each time the simulation ticks.
  function ticked() {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node.attr('cx', d => d.x).attr('cy', d => d.y);
  }

  // Reheat the simulation when drag starts, and fix the subject position.
  function dragstarted(event) {
    if (!event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  // Update the subject (dragged node) position during drag.
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  // Restore the target alpha so the simulation cools after dragging ends.
  // Unfix the subject position now that it’s no longer being dragged.
  function dragended(event) {
    if (!event.active) {
      simulation.alphaTarget(0);
    }
    event.subject.fx = null;
    event.subject.fy = null;
  }

  if (error) {
    return <div>failed to load</div>;
  }
  if (isLoading) {
    return <div>loading...</div>;
  }

  return (
    <svg
      height={height}
      ref={svgRef}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      {/*<g ref={linkRef} stroke="#999" strokeWidth={1.5}>*/}
      {/*  {links.map(link => (*/}
      {/*    <line key={Math.random()} strokeWidth={Math.sqrt(link.value)} />*/}
      {/*  ))}*/}
      {/*</g>*/}

      {/*<g stroke="#fff" strokeWidth={1.5}>*/}
      {/*  {nodes.map(node => (*/}
      {/*    <circle fill={color(node.group)} key={node.name} r={5}>*/}
      {/*      <title>{node.name}</title>*/}
      {/*    </circle>*/}
      {/*  ))}*/}
      {/*</g>*/}
    </svg>
  );
}
