'use client';

import { useEffect } from 'react';
import * as d3 from 'd3';
import data from 'public/miserables.json';

// TODO use document.devicePixelRatio
const dpi = 1;
const width = 928;
const height = 600;
const radius = 5;

export function MyCanvas() {
  useEffect(() => {
    const canvas = document.getElementById('tutorial');

    // Specify the color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const links = data.links.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    let transform = d3.zoomIdentity;

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
      context.save();
      context.clearRect(0, 0, width, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);

      // draw links
      context.save();
      context.globalAlpha = 0.6;
      context.strokeStyle = '#999';
      context.beginPath();
      links.forEach(drawLink);
      context.stroke();
      context.restore();

      // draw nodes
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
      context.moveTo(d.x + radius, d.y);
      context.arc(d.x, d.y, radius, 0, 2 * Math.PI);
    }

    // Add a drag behavior. The _subject_ identifies the closest node to the pointer,
    // conditional on the distance being less than 20 pixels.
    d3.select(canvas)
      .call(
        d3
          .drag()
          .subject(event => {
            const x = transform.invertX(event.x);
            const y = transform.invertY(event.y);
            const rSq = radius * radius;
            let i;
            let node = undefined;
            for (i = nodes.length - 1; i >= 0; --i) {
              const iNode = nodes[i],
                dx = x - iNode.x,
                dy = y - iNode.y,
                distSq = dx * dx + dy * dy;
              if (distSq < rSq) {
                node = iNode;

                node.x = transform.applyX(node.x);
                node.y = transform.applyY(node.y);

                break;
              }
            }

            return node;
          })
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded),
      )
      .call(d3.zoom().scaleExtent([1, 2]).on('zoom', zoomed));

    function zoomed(event) {
      transform = event.transform;
      console.log('zoom event', event);
      // draw();
    }

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragStarted(event) {
      if (!event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      event.subject.fx = transform.invertX(event.subject.x);
      event.subject.fy = transform.invertY(event.subject.y);
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
      event.subject.fx = transform.invertX(event.x);
      event.subject.fy = transform.invertY(event.y);
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragEnded(event) {
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
