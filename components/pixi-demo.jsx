'use client';

import { useLayoutEffect, useRef } from 'react';
import { autoDetectRenderer, Container, Graphics } from 'pixi.js';
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

const width = 900,
  height = 600;

export default function PixiDemo({ postGraph }) {
  const mountedRef = useRef(false);

  useLayoutEffect(() => {
    if (mountedRef.current) {
      return () => {};
    }
    const radius = 5,
      stage = new Container(),
      lines = new Graphics(),
      circles = new Container(),
      rSq = radius * radius,
      baseColor = '#5c5c5c',
      hlColor = '#a88bfa',
      noHlColor = 'rgba(156,163,175,0.5)',
      hlIds = new Set(),
      color = scaleOrdinal(schemeCategory10);
    const renderer = autoDetectRenderer({
      width,
      height,
      autoDensity: true,
      resolution: 2,
      hello: true,
      backgroundColor: 'white',
    });
    document.getElementById('graph-view').appendChild(renderer.view);
    let transform = zoomIdentity.translate(width / 2, height / 2);

    const links = postGraph.links;
    const nodes = postGraph.nodes;
    const view = renderer.view;

    const simulation = forceSimulation()
      .force('charge', forceManyBody())
      .force('x', forceX(width / 2))
      .force('y', forceY(height / 2));

    stage.addChild(lines);
    stage.addChild(circles);

    for (const node of nodes) {
      const circle = new Graphics();

      circle.beginFill(Number.parseInt(color(node.id).substr(1), 16));
      circle.lineStyle(0, 0xffffff);
      circle.drawCircle(0, 0, radius);
      circle.endFill();

      circle.id = node.id;
      circles.addChild(circle);
    }

    const zoomed = event => {
      transform = event.transform;

      stage.x = transform.x;
      stage.y = transform.y;
      stage.scale.x = transform.k;
      stage.scale.y = transform.k;

      requestAnimationFrame(() => renderer.render(stage));
    };

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

    const redraw = () =>
      requestAnimationFrame(() => {
        lines.clear();
        lines.lineStyle(0.5, 0x999999, 0.6);

        for (const link of links) {
          lines.moveTo(link.source.x, link.source.y);
          lines.lineTo(link.target.x, link.target.y);
        }

        renderer.render(stage);
      });

    simulation
      .on('tick', redraw)
      .nodes(circles.children)
      .force(
        'link',
        forceLink(links).id(d => d.id),
      );

    select(view)
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

    mountedRef.current = true;

    // return () => {
    //   simulation.stop();
    // };
  }, []);

  return <div id="graph-view" />;
}
