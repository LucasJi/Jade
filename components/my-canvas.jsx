'use client';

import { useEffect } from 'react';
import * as d3 from 'd3';

const dpi = 2;
const width = 900;
const height = 600;
const radius = 5;

export function MyCanvas({ postGraph }) {
  useEffect(() => {
    if (!dpi) {
      return () => {};
    }

    const canvas = document.getElementById('tutorial');
    const rect = canvas.getBoundingClientRect();

    const ctx = canvas.getContext('2d');
    ctx.scale(dpi, dpi);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // const links = data.links.map(d => ({ ...d }));
    // const nodes = data.nodes.map(d => ({ ...d }));
    const links = postGraph.links;
    const nodes = postGraph.nodes;

    let transform = d3.zoomIdentity;

    // Create a simulation with several forces.
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(d => d.id)
          .strength(0.02),
      )
      .force(
        'charge',
        d3.forceManyBody().distanceMax(Math.min(width, height) / 2),
      )
      .force(
        'center',
        d3.forceCenter(width / 2 / dpi, height / 2 / dpi).strength(0.5),
      )
      .force(
        'forceRadial',
        d3.forceRadial(Math.min(width, height)).strength(0.05),
      )
      .on('tick', draw);

    function draw() {
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.translate(transform.x / dpi, transform.y / dpi);
      ctx.scale(transform.k, transform.k);

      // draw links
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = '#999';
      ctx.strokeWidth = 0.5;
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
        ctx.fillStyle = color((d.id.length % 10).toString());
        ctx.strokeStyle = '#fff';
        ctx.fill();
        ctx.stroke();
      });

      ctx.restore();
    }

    d3.select(canvas)
      .call(
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
      )
      .call(
        d3
          .zoom()
          .scaleExtent([1 / 10, 8])
          .on('zoom', zoomed),
      );

    function zoomed(event) {
      transform = event.transform;
      draw();
    }

    function dragStarted(event) {
      if (!event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      event.subject.fx = transform.invertX(event.x);
      event.subject.fy = transform.invertY(event.y);
      // console.log(
      //   'drag started event (%d, %d) pointer (%d, %d) rect (%d, %d)',
      //   event.x,
      //   event.y,
      //   x,
      //   y,
      //   rect.x,
      //   rect.y,
      //   event,
      // );
    }

    function dragged(event) {
      const [x, y] = d3.pointer(event);
      event.subject.fx = transform.invertX(x - rect.x) / dpi;
      event.subject.fy = transform.invertY(y - rect.y) / dpi;
      // console.log(
      //   'dragged event (%d, %d) pointer (%d, %d) rect (%d, %d)',
      //   event.x,
      //   event.y,
      //   x,
      //   y,
      //   rect.x,
      //   rect.y,
      // );
    }

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
      {dpi && (
        <canvas
          id="tutorial"
          width={width * dpi}
          height={height * dpi}
          style={{
            width: `${width}px`,
            maxWidth: '100%',
            height: `${height}px`,
            borderWidth: '1px',
            borderColor: 'red',
          }}
        >
          current stock price: $3.15 +0.15
        </canvas>
      )}
    </div>
  );
}
