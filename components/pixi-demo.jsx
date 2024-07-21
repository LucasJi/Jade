'use client';

import { useLayoutEffect, useRef } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import {
  drag,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  scaleOrdinal,
  schemeCategory10,
  select,
  zoom,
  zoomIdentity,
} from 'd3';

const width = 600,
  height = 600;

export default function PixiDemo({ postGraph }) {
  const mountedRef = useRef(false);

  useLayoutEffect(() => {
    if (mountedRef.current) {
      return () => {};
    }

    const app = new Application();

    const radius = 5,
      lines = new Graphics(),
      circles = new Container(),
      rSq = radius * radius,
      baseColor = '#5c5c5c',
      hlColor = '#a88bfa',
      noHlColor = 'rgba(156,163,175,0.5)',
      hlIds = new Set(),
      color = scaleOrdinal(schemeCategory10);

    let transform = zoomIdentity.translate(width / 2, height / 2);

    const links = postGraph.links;
    const nodes = postGraph.nodes;

    app
      .init({
        width,
        height,
        autoDensity: true,
        resolution: 2,
        hello: true,
        backgroundColor: 'white',
        antialias: true,
      })
      .then(() => {
        document.getElementById('graph-view').appendChild(app.canvas);

        const simulation = forceSimulation()
          .force('charge', forceManyBody())
          .force('x', forceX(width / 2))
          .force('y', forceY(height / 2));

        const dragSubject = event => {
          return simulation.find(
            transform.invertX(event.x),
            transform.invertY(event.y),
            radius,
          );
        };

        const dragStarted = event => {
          if (!event.active) {
            simulation.alphaTarget(0.3).restart();
          }

          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        };

        const dragged = event => {
          event.subject.fx += event.dx / transform.k;
          event.subject.fy += event.dy / transform.k;
        };

        const dragEnded = event => {
          if (!event.active) {
            simulation.alphaTarget(0);
          }

          event.subject.fx = null;
          event.subject.fy = null;
        };

        app.stage.addChild(lines);
        app.stage.addChild(circles);

        for (const node of nodes) {
          const number = Number.parseInt(color(node.id).substr(1), 16);

          const circle = new Graphics()
            .circle(0, 0, radius)
            .fill(number)
            .setStrokeStyle({ width: 0.5, color: number });

          circle.id = node.id;
          // accept events, trigger hover status
          circle.eventMode = 'dynamic';

          circles.addChild(circle);
        }

        const zoomed = event => {
          transform = event.transform;

          app.stage.x = transform.x;
          app.stage.y = transform.y;
          app.stage.scale.x = transform.k;
          app.stage.scale.y = transform.k;
        };

        const redraw = () => {
          lines.clear();
          // lines.setStrokeStyle({ width: 0.5, color: baseColor, alpha: 1 });

          for (const link of links) {
            lines.stroke({ width: 0.5, color: baseColor, alpha: 1 });
            lines.moveTo(link.source.x, link.source.y);
            lines.lineTo(link.target.x, link.target.y);
          }
        };

        simulation
          .on('tick', () => {})
          .nodes(circles.children)
          .force(
            'link',
            forceLink(links).id(d => d.id),
          );

        app.ticker.add(function updateGraphLinks(delta) {
          simulation.tick();
          redraw();
        });

        select(app.canvas)
          .call(
            drag()
              .subject(dragSubject)
              .on('start', dragStarted)
              .on('drag', dragged)
              .on('end', dragEnded),
          )
          .call(
            zoom()
              .scaleExtent([1 / 10, 8])
              .on('zoom', zoomed),
          );
      });

    mountedRef.current = true;
  }, []);

  return <div id="graph-view" />;
}
