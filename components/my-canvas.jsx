'use client';

import { useEffect } from 'react';
import * as d3 from 'd3';
import data from 'public/miserables.json';

// TODO use document.devicePixelRatio
const dpi = 1.25;
const width = 928;
const height = 600;
const radius = 5;

export function MyCanvas() {
  useEffect(() => {
    // canvas
    const canvas = document.getElementById('tutorial');

    // ctx
    const ctx = canvas.getContext('2d');
    ctx.scale(dpi, dpi);

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
      .force('center', d3.forceCenter(width / 2 / dpi, height / 2 / dpi))
      .on('tick', draw);

    function draw() {
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      // ctx.translate(transform.x / dpi, transform.y / dpi);
      // ctx.scale(transform.k, transform.k);

      // draw links
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = '#999';
      links.forEach(d => {
        ctx.beginPath();
        ctx.moveTo(d.source.x, d.source.y);
        ctx.lineTo(d.target.x, d.target.y);
        ctx.stroke();
      });

      // draw nodes
      ctx.strokeStyle = '#fff';
      ctx.globalAlpha = 1;
      nodes.forEach(d => {
        ctx.beginPath();
        ctx.moveTo(d.x + radius, d.y);
        ctx.arc(d.x, d.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color(d.group);
        ctx.strokeStyle = '#fff';
        ctx.fill();
        ctx.stroke();
      });

      ctx.restore();
    }

    // Add a drag behavior. The _subject_ identifies the closest node to the pointer,
    // conditional on the distance being less than 20 pixels.
    d3.select(canvas).call(
      d3
        .drag()
        .container(canvas)
        .subject(event => {
          const x = transform.invertX(event.x);
          const y = transform.invertY(event.y);
          const rSq = radius * radius;
          let i;
          let node = undefined;
          for (i = nodes.length - 1; i >= 0; --i) {
            const iNode = nodes[i],
              dx = x / dpi - iNode.x,
              dy = y / dpi - iNode.y,
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
    );
    // .call(
    //   d3
    //     .zoom()
    //     .scaleExtent([1 / 10, 8])
    //     .on('zoom', zoomed),
    // );

    function zoomed(event) {
      transform = event.transform;
      draw();
    }

    // Reheat the simulation when drag starts, and fix the subject position.
    function dragStarted(event) {
      if (!event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      const rect = canvas.getBoundingClientRect();
      const [x, y] = d3.pointer(event);
      event.subject.fx = (x - rect.x) / dpi;
      event.subject.fy = (y - rect.y) / dpi;
      // event.subject.fx = transform.invertX(event.x);
      // event.subject.fy = transform.invertY(event.y);
    }

    // Update the subject (dragged node) position during drag.
    function dragged(event) {
      const rect = canvas.getBoundingClientRect();
      const [x, y] = d3.pointer(event);
      event.subject.fx = (x - rect.x) / dpi;
      event.subject.fy = (y - rect.y) / dpi;
      console.log(event.x, event.y, x, y, rect.x, rect.y);
      // event.subject.fx = transform.invertX(event.x);
      // event.subject.fy = transform.invertY(event.y);
    }

    // Restore the target alpha so the simulation cools after dragging ends.
    // Unfix the subject position now that it’s no longer being dragged.
    function dragEnded(event) {
      if (!event.active) {
        simulation.alphaTarget(0);
      }
      // event.subject.fx = null;
      // event.subject.fy = null;
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
        style={{
          width: '928px',
          maxWidth: '100%',
          height: 'auto',
          borderWidth: '1px',
          borderColor: 'red',
        }}
      >
        current stock price: $3.15 +0.15
      </canvas>
    </div>
  );
}
