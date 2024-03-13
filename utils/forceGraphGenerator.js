import * as d3 from 'd3';

export function runForceGraph(container, linksData, nodesData) {
  const links = linksData.map(d => Object.assign({}, d));
  const nodes = nodesData.map(d => Object.assign({}, d));

  const containerRect = container.getBoundingClientRect();

  // const height = containerRect.height;
  // const width = containerRect.width;

  const height = 300;
  const width = 300;

  const drag = simulation => {
    const dragstarted = (event, d) => {
      if (!event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    };

    const dragended = (event, d) => {
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

  const simulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3.forceLink(links).id(d => d.wikilink),
    )
    .force('charge', d3.forceManyBody().strength(-150))
    .force('x', d3.forceX())
    .force('y', d3.forceY());

  const svg = d3
    .select(container)
    .append('svg')
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .call(
      d3.zoom().on('zoom', function (event) {
        svg.attr('transform', event.transform);
      }),
    );

  const link = svg
    .append('g')
    .attr('stroke', 'grey')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke-width', 0.5);

  const node = svg
    .append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 8)
    .attr('fill', 'grey')
    .call(drag(simulation));

  const title = svg
    .append('g')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .text(d => d.title)
    .call(drag(simulation));

  simulation.on('tick', () => {
    //update link positions
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    // update node positions
    node.attr('cx', d => d.x).attr('cy', d => d.y);

    // update title positions
    title
      .attr('x', d => {
        return d.x;
      })
      .attr('y', d => {
        return d.y;
      });
  });

  return {
    nodes: () => {
      return svg.node();
    },
    simulation,
  };
}
