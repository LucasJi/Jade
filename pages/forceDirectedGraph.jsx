//useSWR allows the use of SWR inside function components
import useSWR from 'swr';
import * as d3 from 'd3';
import { useRef } from 'react';

//Write a fetcher function to wrap the native fetch function and return the result of a call to url in json format
const fetcher = url => fetch(url).then(res => res.json());
export default function ForceDirectedGraph() {
  const { data, error, isLoading } = useSWR('/api/testdata', fetcher);
  const linkRef = useRef();

  if (error) {
    return <div>failed to load</div>;
  }
  if (isLoading) {
    return <div>loading...</div>;
  }

  // Specify the dimensions of the chart.
  const width = 928;
  const height = 600;

  // Specify the color scale.
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // The force simulation mutates links and nodes, so create a copy
  // so that re-evaluating this cell produces the same result.
  const links = data.links.map(d => ({ ...d }));
  const nodes = data.nodes.map(d => ({ ...d }));

  return (
    <svg
      height={height}
      style={{
        maxWidth: '100%',
        height: 'auto',
      }}
      viewBox={[0, 0, width, height]}
      width={width}
    >
      <g ref={linkRef} stroke="#fff" strokeWidth={1.5} />
    </svg>
  );
}
