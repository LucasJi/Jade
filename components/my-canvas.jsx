'use client';

import { useEffect } from 'react';
import * as d3 from 'd3';
import data from 'public/miserables.json';

// TODO use document.devicePixelRatio
const dpi = 1.25;
const width = 928;
const height = 600;

export function MyCanvas() {
  useEffect(() => {
    const canvas = document.getElementById('tutorial');

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = data.links.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    // Create a simulation with several forces.
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id(d => d.id),
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))
      .on('tick', draw);

    const context = canvas.getContext('2d');
    context.scale(dpi, dpi);

    function draw() {
      context.clearRect(0, 0, width, height);

      context.save();
      context.globalAlpha = 0.6;
      context.strokeStyle = '#999';
      context.beginPath();
      links.forEach(drawLink);
      context.stroke();
      context.restore();

      context.save();
      context.strokeStyle = '#fff';
      context.globalAlpha = 1;
      nodes.forEach(node => {
        context.beginPath();
        drawNode(node);
        context.fillStyle = color(node.group);
        context.strokeStyle = '#fff';
        context.fill();
        context.stroke();
      });
      context.restore();
    }

    function drawLink(d) {
      context.moveTo(d.source.x, d.source.y);
      context.lineTo(d.target.x, d.target.y);
    }

    function drawNode(d) {
      context.moveTo(d.x + 5, d.y);
      context.arc(d.x, d.y, 5, 0, 2 * Math.PI);
    }

    // Add a drag behavior. The _subject_ identifies the closest node to the pointer,
    // conditional on the distance being less than 20 pixels.
    d3.select(canvas).call(
      d3
        .drag()
        .subject(event => {
          const [px, py] = d3.pointer(event, canvas);
          return d3.least(nodes, ({ x, y }) => {
            const dist2 = (x - px) ** 2 + (y - py) ** 2;
            return Math.sqrt(dist2);
          });
        })
        .on('start', handleDragStart)
        .on('drag', handleDrag)
        .on('end', handleDragEnd),
    );

    // Reheat the simulation when drag starts, and fix the subject position.
    function handleDragStart(event) {
      if (!event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    // Update the subject (dragged node) position during drag.
    function handleDrag(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function handleDragEnd(event) {
      if (!event.active) {
        simulation.alphaTarget(0);
      }
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // When this cell is re-run, stop the previous simulation. (This doesn’t
    // really matter since the target alpha is zero and the simulation will
    // stop naturally, but it’s a good practice.)
    // d3.invalidation.then(() => simulation.stop());
  }, []);

  return (
    <div>
      <canvas
        id="tutorial"
        width={width * dpi}
        height={height * dpi}
        style={{ width: '928px', maxWidth: '100%', height: 'auto' }}
      >
        current stock price: $3.15 +0.15
      </canvas>
    </div>
  );
}
