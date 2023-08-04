//useSWR allows the use of SWR inside function components
import useSWR from 'swr';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [animatedLinks, setAnimatedLinks] = useState([]);
  const [animatedNodes, setAnimatedNodes] = useState([]);
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
        forceLink(links).id(d => d.id),
      )
      .force('charge', forceManyBody())
      .force('center', forceCenter(width / 2, height / 2));

    // simulation.on('tick', () => {
    //   setAnimatedNodes([...simulation.nodes()]);
    //   setAnimatedLinks([...links]);
    // });

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

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('cx', d => d.x).attr('cy', d => d.y);
    });

    node.append('title').text(d => d.id);

    node.call(
      drag()
        .on('start', event => {
          if (!event.active) {
            simulation.alphaTarget(0.3).restart();
          }
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on('drag', event => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on('end', event => {
          if (!event.active) {
            simulation.alphaTarget(0);
          }
          event.subject.fx = null;
          event.subject.fy = null;
        }),
    );

    return () => simulation.stop();
  }, [data, svgRef.current]);

  if (error) {
    return <div>failed to load</div>;
  }
  if (isLoading) {
    return <div>loading...</div>;
  }

  // return (
  //   <svg
  //     height={height}
  //     style={{
  //       maxWidth: '100%',
  //       height: 'auto',
  //     }}
  //     viewBox={`0 0 ${width} ${height}`}
  //     width={width}
  //   >
  //     <g stroke="#999" strokeOpacity={0.6}>
  //       {animatedLinks.map(link => {
  //         const {
  //           source: { x: x1, y: y1, id: sourceId },
  //           target: { x: x2, y: y2, id: targetId },
  //         } = link;
  //         return (
  //           <line
  //             // chose a suitable key can improve render performance
  //             key={`${sourceId}-${targetId}`}
  //             strokeWidth={Math.sqrt(link.value)}
  //             x1={x1}
  //             x2={x2}
  //             y1={y1}
  //             y2={y2}
  //           />
  //         );
  //       })}
  //     </g>
  //
  //     <g stroke="#fff" strokeWidth={1.5}>
  //       {animatedNodes.map(node => (
  //         <circle
  //           cx={node.x}
  //           cy={node.y}
  //           fill={color(node.group)}
  //           key={node.id}
  //           onDrag={event => {
  //             console.log(event);
  //           }}
  //           r={5}
  //         >
  //           <title>{node.id}</title>
  //         </circle>
  //       ))}
  //     </g>
  //   </svg>
  // );
  return <svg ref={svgRef} />;
}
