//useSWR allows the use of SWR inside function components
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force';

const fetcher = url => fetch(url).then(res => res.json());
export default function ForceDirectedGraph() {
  const { data, error, isLoading } = useSWR('/api/testdata', fetcher);
  const [animatedLinks, setAnimatedLinks] = useState([]);
  const [animatedNodes, setAnimatedNodes] = useState([]);

  // Specify the dimensions of the chart.
  const width = 928;
  const height = 600;

  // Specify the color scale.
  const color = scaleOrdinal(schemeCategory10);

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

    simulation.on('tick', () => {
      setAnimatedNodes([...simulation.nodes()]);
      setAnimatedLinks([...links]);
    });

    return () => simulation.stop();
  }, [data]);

  if (error) {
    return <div>failed to load</div>;
  }
  if (isLoading) {
    return <div>loading...</div>;
  }

  return (
    <svg
      height={height}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <g stroke="#999" strokeOpacity={0.6}>
        {animatedLinks.map(link => {
          const {
            source: { x: x1, y: y1, id: sourceId },
            target: { x: x2, y: y2, id: targetId },
          } = link;
          return (
            <line
              // chose a suitable key can improve render performance
              key={`${sourceId}-${targetId}`}
              strokeWidth={Math.sqrt(link.value)}
              x1={x1}
              x2={x2}
              y1={y1}
              y2={y2}
            />
          );
        })}
      </g>

      <g stroke="#fff" strokeWidth={1.5}>
        {animatedNodes.map(node => (
          <circle
            cx={node.x}
            cy={node.y}
            fill={color(node.group)}
            key={node.id}
            r={5}
          >
            <title>{node.id}</title>
          </circle>
        ))}
      </g>
    </svg>
  );
}
