'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const dpi = 1.25;
const width = 900;
const height = 600;
const radius = 5;
const rSq = radius * radius;
const color = '#9ca3af';

const dragStarted = (event, transform, simulation) => {
  if (!event.active) {
    simulation.alphaTarget(0.3).restart();
  }
  event.subject.fx = transform.invertX(event.x);
  event.subject.fy = transform.invertY(event.y);
  const [x, y] = d3.pointer(event);
  console.log(
    'drag started event (%d, %d) pointer (%d, %d)',
    event.x,
    event.y,
    x,
    y,
    event,
  );
};

const dragged = (event, transform, rect) => {
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
};

const dragEnded = (event, simulation) => {
  if (!event.active) {
    simulation.alphaTarget(0);
  }
  event.subject.fx = null;
  event.subject.fy = null;
};

export function MyCanvas({ postGraph }) {
  const nodeRef = useRef(null);

  useEffect(() => {
    if (!dpi) {
      return () => {};
    }

    const canvas = document.getElementById('tutorial');
    const rect = canvas.getBoundingClientRect();

    const ctx = canvas.getContext('2d');
    ctx.scale(dpi, dpi);

    // 性能优化
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = '0.5';

    // const links = data.links.map(d => ({ ...d }));
    // const nodes = data.nodes.map(d => ({ ...d }));
    const links = postGraph.links;
    const nodes = postGraph.nodes;

    let transform = d3.zoomIdentity;

    function draw() {
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.translate(transform.x / dpi, transform.y / dpi);
      ctx.scale(transform.k, transform.k);

      // draw links
      ctx.strokeStyle = '#999';
      links.forEach(d => {
        ctx.beginPath();
        ctx.moveTo(d.source.x, d.source.y);
        ctx.lineTo(d.target.x, d.target.y);
        ctx.stroke();
      });

      // draw nodes
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1;
      nodes.forEach(d => {
        ctx.beginPath();
        ctx.moveTo(d.x + radius, d.y);
        ctx.arc(d.x, d.y, radius, 0, 2 * Math.PI);

        if (d.id === nodeRef.current?.id) {
          ctx.fillStyle = '#a88bfa';
          ctx.strokeStyle = '#a88bfa';
        }

        ctx.fill();

        // ctx.fillText('天若有情', d.x, d.y + radius + 2);
        // ctx.font = '5px sans-serif';
        // ctx.textAlign = 'center';
        // ctx.textBaseline = 'top';

        ctx.stroke();

        if (d.id === nodeRef.current?.id) {
          ctx.fillStyle = color;
          ctx.strokeStyle = color;
        }
      });

      ctx.restore();
    }

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
      .force('collide', d3.forceCollide(radius).strength(0.6))
      .on('tick', () => draw());

    function findNode(event) {
      const x = transform.invertX(event.x);
      const y = transform.invertY(event.y);
      for (let i = nodes.length - 1; i >= 0; --i) {
        const iNode = nodes[i],
          dx = x / dpi - iNode.x,
          dy = y / dpi - iNode.y,
          distSq = dx * dx + dy * dy;
        if (distSq < rSq) {
          iNode.x = transform.applyX(iNode.x);
          iNode.y = transform.applyY(iNode.y);
          return iNode;
        }
      }

      return undefined;
    }

    d3.select(canvas)
      .call(
        d3
          .drag()
          .container(canvas)
          .subject(findNode)
          .on('start', event => dragStarted(event, transform, simulation))
          .on('drag', event => dragged(event, transform, rect))
          .on('end', event => dragEnded(event, simulation)),
      )
      .call(
        d3
          .zoom()
          .scaleExtent([1 / 10, 8])
          .on('zoom', zoomed),
      )
      .on('mousemove', function (event) {
        const [x, y] = d3.pointer(event);
        const invertedX = transform.invertX(x) / dpi;
        const invertedY = transform.invertY(y) / dpi;
        // console.log(
        //   'mousemove event (%d, %d) pointer (%d, %d) invert (%d, %d)',
        //   event.x,
        //   event.y,
        //   x,
        //   y,
        //   invertedX,
        //   invertedY,
        // );

        let node = null;

        // try to get node from cache
        if (nodeRef.current) {
          const cachedNode = nodeRef.current,
            dx = invertedX - cachedNode.x,
            dy = invertedY - cachedNode.y;

          if (dx * dx + dy * dy < rSq) {
            // mouse move on the same node, re-draw
            node = cachedNode;
          } else {
            nodeRef.current = null;
            // mouse move on new node, re-draw
            draw();
          }
        }

        // iterate to find hovered node
        if (!node) {
          for (let i = nodes.length - 1; i >= 0; --i) {
            const iNode = nodes[i],
              dx = invertedX - iNode.x,
              dy = invertedY - iNode.y,
              distSq = dx * dx + dy * dy;
            if (distSq < rSq) {
              nodeRef.current = iNode;
              node = iNode;
              // mouse move away from node, re-draw
              draw();
              break;
            }
          }
        }
      });

    function zoomed(event) {
      transform = event.transform;
      draw();
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
