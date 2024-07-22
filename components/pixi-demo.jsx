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

    const app = new Application();

    const radius = 5,
      lines = new Graphics(),
      circles = new Container(),
      baseColor = '#838383',
      hlColor = '#a88bfa',
      hlTintColor = 'rgba(168,139,250,0)',
      noHlColor = 'rgba(156,163,175,1)';

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

          event.subject.tint = hlTintColor;
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

        app.stage.addChild(lines);
        app.stage.addChild(circles);

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          nodeIdxMapRef.current.set(node.id, i);

          const circle = new Graphics()
            .circle(0, 0, radius)
            .fill({ color: baseColor, alpha: 1 });
          circle.id = node.id;

          // accept events, trigger hover status
          circle.eventMode = 'static';
          circle.cursor = 'pointer';

          // events
          circle
            .on('pointerover', function () {
              if (!draggingRef.current) {
                this.tint = hlTintColor;
                overedNodeRef.current = this.id;
                redraw();
                const overedNodeIdx = nodeIdxMapRef.current.get(this.id);
                const overedNode = nodes[overedNodeIdx];
                circles.children.forEach(child => {
                  if (
                    child.id !== this.id &&
                    !overedNode.forwardLinks.includes(child.id)
                  ) {
                    child.tint = noHlColor;
                    child.alpha = 0.1;
                  }
                });
              }
            })
            .on('pointerout', function () {
              if (!draggingRef.current) {
                overedNodeRef.current = null;
                redraw();
                circles.children.forEach(child => {
                  child.tint = null;
                  child.alpha = 1;
                });
              }
            });

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

        simulation
          .on('tick', redraw)
          .nodes(circles.children)
          .force(
            'link',
            forceLink(links).id(d => d.id),
          );

        // app.ticker.add(function updateGraphLinks(delta) {
        //   simulation.tick();
        //   redraw();
        // });

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
