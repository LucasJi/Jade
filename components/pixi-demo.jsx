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
  select,
  zoom,
  zoomIdentity,
} from 'd3';

const width = 600,
  height = 600;

export default function PixiDemo({ postGraph }) {
  const mountedRef = useRef(false);
  const overedNodeRef = useRef(null);
  const nodeIdxMapRef = useRef(new Map());
  const draggingRef = useRef(false);

  useLayoutEffect(() => {
    if (mountedRef.current) {
      return () => {};
    }

    const radius = 5,
      lines = new Graphics(),
      circles = new Container(),
      baseColor = '#5c5c5c',
      hlColor = '#a88bfa',
      noHlColor = '#9ca3af80',
      links = postGraph.links,
      nodes = postGraph.nodes,
      app = new Application(),
      duration = 2000, // Duration in milliseconds
      simulation = forceSimulation()
        .force('charge', forceManyBody())
        .force('x', forceX(width / 2))
        .force('y', forceY(height / 2));

    let transform = zoomIdentity.translate(width / 2, height / 2),
      elapsed = 0;

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

      draggingRef.current = true;
      overedNodeRef.current = event.subject.id;
    };

    const dragEnded = event => {
      if (!event.active) {
        simulation.alphaTarget(0);
      }

      event.subject.fx = null;
      event.subject.fy = null;

      event.subject.tint = null;
      draggingRef.current = false;
      overedNodeRef.current = null;
    };

    const zoomed = event => {
      transform = event.transform;

      app.stage.x = transform.x;
      app.stage.y = transform.y;
      app.stage.scale.x = transform.k;
      app.stage.scale.y = transform.k;
    };

    const drawLines = () => {
      lines.clear();

      for (const link of links) {
        lines.moveTo(link.source.x, link.source.y);
        lines.lineTo(link.target.x, link.target.y);
        if (overedNodeRef.current) {
          if (link.source.id === overedNodeRef.current) {
            lines.stroke({ width: 0.2, color: hlColor, alpha: 1 });
          } else {
            lines.stroke({ width: 0.2, color: baseColor, alpha: 0.1 });
          }
        } else {
          lines.stroke({ width: 0.2, color: baseColor, alpha: 1 });
        }
      }
    };

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

        app.stage.addChild(lines);
        app.stage.addChild(circles);

        const drawCircles = color => {
          circles.removeChildren();
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            nodeIdxMapRef.current.set(node.id, i);

            const circle = new Graphics()
              .circle(node.x, node.y, radius)
              .fill({ color, alpha: 1 });
            circle.id = node.id;

            // accept events, trigger hover status
            circle.eventMode = 'static';
            circle.cursor = 'pointer';

            // events
            circle
              .on('pointerover', function () {
                if (!draggingRef.current) {
                  overedNodeRef.current = this.id;
                  // drawLines();
                  this.clear();
                  this.circle(node.x, node.y, radius).fill(hlColor);
                  app.renderer.render(app.stage);
                }
              })
              .on('pointerout', function () {
                if (!draggingRef.current) {
                  overedNodeRef.current = null;
                  drawLines();
                  this.clear();
                  this.circle(node.x, node.y, radius).fill(baseColor);
                  app.renderer.render(app.stage);
                  elapsed = 0;
                }
              });

            circles.addChild(circle);
          }
        };
        drawCircles(baseColor);

        simulation
          .on('tick', drawLines)
          .nodes(circles.children)
          .force(
            'link',
            forceLink(links).id(d => d.id),
          );

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

        // change color gradually
        app.ticker.add(delta => {
          if (!overedNodeRef.current) {
            return;
          }

          elapsed += delta.elapsedMS;
          const factor = Math.min(elapsed / duration, 1);

          if (factor >= 1) {
            return;
          }

          const overedNodeIdx = nodeIdxMapRef.current.get(
            overedNodeRef.current,
          );
          const overedNode = nodes[overedNodeIdx];

          lines.clear();
          for (const link of links) {
            lines.moveTo(link.source.x, link.source.y);
            lines.lineTo(link.target.x, link.target.y);
            if (overedNodeRef.current) {
              if (link.source.id === overedNodeRef.current) {
                lines.stroke({ width: 0.2, color: hlColor, alpha: 1 });
              } else {
                lines.stroke({
                  width: 0.2,
                  color: baseColor,
                  alpha: 1 - 0.9 * factor,
                });
              }
            } else {
              lines.stroke({ width: 0.2, color: baseColor, alpha: 1 });
            }
          }
        });

        // recover color gradually
      });

    mountedRef.current = true;
  }, []);

  return <div id="graph-view" />;
}
