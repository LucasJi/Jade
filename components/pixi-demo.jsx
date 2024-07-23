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
  const lastOveredNodeRef = useRef(null);
  const nodeIdxMapRef = useRef(new Map());
  const draggingRef = useRef(false);
  const dynamicAlphaRef = useRef(1);

  useLayoutEffect(() => {
    if (mountedRef.current) {
      return () => {};
    }

    const radius = 5,
      lines = new Graphics(),
      circles = new Container(),
      lineWidth = 0.2,
      baseColor = '#5c5c5c',
      hlColor = '#a88bfa',
      links = postGraph.links,
      nodes = postGraph.nodes,
      app = new Application(),
      duration = 3000, // Duration in milliseconds
      simulation = forceSimulation()
        .force('charge', forceManyBody())
        .force('x', forceX(width / 2))
        .force('y', forceY(height / 2));

    let transform = zoomIdentity.translate(width / 2, height / 2),
      overElapsed = 0,
      recoverElapsed = 0;

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
      overedNodeRef.current = nodes[event.subject.index];
      lastOveredNodeRef.current = null;
    };

    const dragEnded = event => {
      if (!event.active) {
        simulation.alphaTarget(0);
      }

      event.subject.fx = null;
      event.subject.fy = null;

      draggingRef.current = false;
      overedNodeRef.current = null;
      lastOveredNodeRef.current = nodes[event.subject.index];
    };

    const zoomed = event => {
      transform = event.transform;

      app.stage.x = transform.x;
      app.stage.y = transform.y;
      app.stage.scale.x = transform.k;
      app.stage.scale.y = transform.k;
    };

    const drawLines = (baseAlpha = 1, noHlAlpha = 0.2) => {
      lines.clear();

      for (const link of links) {
        lines.moveTo(link.source.x, link.source.y);
        lines.lineTo(link.target.x, link.target.y);
        if (overedNodeRef.current) {
          if (link.source.id === overedNodeRef.current.id) {
            lines.stroke({
              width: lineWidth,
              color: hlColor,
              alpha: baseAlpha,
            });
          } else {
            lines.stroke({
              width: lineWidth,
              color: baseColor,
              alpha: noHlAlpha,
            });
          }
        } else if (lastOveredNodeRef.current) {
          if (link.source.id === lastOveredNodeRef.current.id) {
            lines.stroke({
              width: lineWidth,
              color: baseColor,
              alpha: baseAlpha,
            });
          } else {
            lines.stroke({
              width: lineWidth,
              color: baseColor,
              alpha: noHlAlpha,
            });
          }
        } else {
          lines.stroke({
            width: lineWidth,
            color: baseColor,
            alpha: baseAlpha,
          });
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
                  overedNodeRef.current = node;
                  lastOveredNodeRef.current = null;
                }
              })
              .on('pointerout', function () {
                if (!draggingRef.current) {
                  overedNodeRef.current = null;
                  lastOveredNodeRef.current = node;
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
            overElapsed = 0;
            return;
          }

          overElapsed += delta.elapsedMS;
          const factor = Math.min(overElapsed / duration, 1);

          if (factor >= 1) {
            return;
          }

          const overedNode = overedNodeRef.current;

          dynamicAlphaRef.current -= 0.8 * factor;

          if (dynamicAlphaRef.current <= 0.2) {
            dynamicAlphaRef.current = 0.2;
          }

          drawLines(1, dynamicAlphaRef.current);

          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const circle = circles.children[i];

            const alpha =
              node.id === overedNode.id ||
              overedNode.forwardLinks.includes(node.id)
                ? 1
                : dynamicAlphaRef.current;

            const color = node.id === overedNode.id ? hlColor : baseColor;

            circle.clear();
            circle.circle(node.x, node.y, radius).fill({ color, alpha });
          }

          app.render();
        });

        // recover color gradually
        app.ticker.add(delta => {
          if (!lastOveredNodeRef.current) {
            recoverElapsed = 0;
            return;
          }

          recoverElapsed += delta.elapsedMS;
          const factor = Math.min(recoverElapsed / duration, 1);

          if (factor >= 1) {
            lastOveredNodeRef.current = null;
            return;
          }

          dynamicAlphaRef.current += 0.8 * factor;

          if (dynamicAlphaRef.current >= 1) {
            dynamicAlphaRef.current = 1;
          }

          drawLines(1, dynamicAlphaRef.current);
          const lastOveredNode = lastOveredNodeRef.current;

          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const circle = circles.children[i];
            const alpha =
              node.id === lastOveredNode.id ||
              lastOveredNode.forwardLinks.includes(node.id)
                ? 1
                : dynamicAlphaRef.current;
            circle.clear();
            circle
              .circle(node.x, node.y, radius)
              .fill({ color: baseColor, alpha });
          }

          app.render();
        });
      });

    mountedRef.current = true;
  }, []);

  return <div id="graph-view" />;
}
