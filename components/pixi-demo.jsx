'use client';

import { useLayoutEffect, useRef } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import {
  drag,
  forceCollide,
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
  height = 600,
  lineWidth = 0.2,
  basicColor = '#5c5c5c',
  basicRgbColor = [92, 92, 92],
  hlColor = '#a88bfa',
  hlRgbColor = [168, 139, 250],
  duration = 1000, // Duration in milliseconds
  minAlpha = 0.2,
  maxAlpha = 1,
  radius = 5;

const hexToRgb = hex => {
  const bigint = parseInt(String(hex).slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

const rgbToHex = (r, g, b) =>
  '#' +
  ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

const interpolateColor = (startColor, endColor, factor = 0.5) => {
  const result = startColor.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (endColor[i] - result[i]));
  }

  return result;
};

export default function PixiDemo({ postGraph }) {
  const mountedRef = useRef(false);

  useLayoutEffect(() => {
    if (mountedRef.current) {
      return () => {};
    }

    const lines = new Graphics(),
      circles = new Container(),
      links = postGraph.links,
      nodes = postGraph.nodes,
      app = new Application(),
      simulation = forceSimulation()
        .force('charge', forceManyBody())
        .force('x', forceX(width / 2))
        .force('y', forceY(height / 2))
        .force('collision', forceCollide().radius(radius).iterations(2));

    let transform = zoomIdentity.translate(width / 2, height / 2),
      overElapsed = 0,
      recoverElapsed = 0,
      dynamicAlpha = minAlpha,
      overedNode = null,
      lastOveredNode = null,
      dragging = false;

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

      dragging = true;
      overedNode = nodes[event.subject.index];
      lastOveredNode = null;
    };

    const dragEnded = event => {
      if (!event.active) {
        simulation.alphaTarget(0);
      }

      event.subject.fx = null;
      event.subject.fy = null;

      dragging = false;
      overedNode = null;
      lastOveredNode = nodes[event.subject.index];
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

      if (overedNode) {
        for (const link of links) {
          lines.moveTo(link.source.x, link.source.y);
          lines.lineTo(link.target.x, link.target.y);

          let alpha =
            link.target.id === overedNode.id
              ? link.source.alpha
              : link.target.alpha;

          if (
            !overedNode.forwardLinks.includes(link.source.id) &&
            overedNode.forwardLinks.includes(link.target.id)
          ) {
            alpha = link.source.alpha;
          }

          if (
            overedNode.forwardLinks.includes(link.source.id) &&
            overedNode.forwardLinks.includes(link.target.id)
          ) {
            alpha = Math.max(minAlpha, link.source.alpha);
          }

          lines.stroke({
            width: lineWidth,
            color: link.source._fillColor || basicColor,
            alpha,
          });
        }
      } else if (lastOveredNode) {
        for (const link of links) {
          lines.moveTo(link.source.x, link.source.y);
          lines.lineTo(link.target.x, link.target.y);
          lines.stroke({
            width: lineWidth,
            color: basicColor,
            alpha: maxAlpha,
          });
        }
      } else {
        for (const link of links) {
          lines.moveTo(link.source.x, link.source.y);
          lines.lineTo(link.target.x, link.target.y);
          lines.stroke({
            width: lineWidth,
            color: basicColor,
            alpha: maxAlpha,
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
                if (!dragging) {
                  circles.children.forEach(child => {
                    if (child._baseRgbColor) {
                      delete child._baseRgbColor;
                    }
                  });

                  overedNode = node;
                  lastOveredNode = null;
                }
              })
              .on('pointerout', function () {
                if (!dragging) {
                  circles.children.forEach(child => {
                    if (child._baseRgbColor) {
                      delete child._baseRgbColor;
                    }
                  });

                  overedNode = null;
                  lastOveredNode = node;
                }
              });

            circles.addChild(circle);
          }
        };
        drawCircles(basicColor);

        simulation
          .on('tick', () => {})
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
          if (!overedNode) {
            overElapsed = 0;
            return;
          }

          const { elapsedMS } = delta;

          overElapsed += elapsedMS;

          if (overElapsed >= duration) {
            return;
          }

          const alphaVariation = (0.8 / duration) * elapsedMS;

          // when dragging, d3 simulation draws lines
          if (!dragging) {
            drawLines();
          }

          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const circle = circles.children[i];

            // update alpha
            let alpha = 1;
            if (
              node.id !== overedNode.id &&
              !overedNode.forwardLinks.includes(node.id)
            ) {
              alpha = Math.max(minAlpha, circle.alpha - alphaVariation);
            } else {
              alpha = Math.min(maxAlpha, circle.alpha + alphaVariation);
            }

            // update color: highlight the hovered node and downplay others
            let color = basicColor;
            const fillColor = circle._fillColor || basicColor;
            // update color gradually
            let baseRgbColor = circle._baseRgbColor;
            if (!baseRgbColor) {
              baseRgbColor = hexToRgb(fillColor);
              circle._baseRgbColor = baseRgbColor;
            }
            if (node.id === overedNode.id) {
              const rgb = interpolateColor(
                baseRgbColor,
                hlRgbColor,
                overElapsed / duration,
              );
              color = rgbToHex(...rgb);
              circle._fillColor = color;
            } else if (fillColor !== basicColor) {
              const rgb = interpolateColor(
                baseRgbColor,
                basicRgbColor,
                overElapsed / duration,
              );
              color = rgbToHex(...rgb);
              circle._fillColor = color;
            }

            // apply the updated properties
            circle.clear();
            circle.circle(node.x, node.y, radius).fill(color);
            circle.alpha = alpha;
          }

          app.render();
        });

        app.ticker.add(() => {
          if (!overedNode && !lastOveredNode) {
            simulation.tick();
            drawLines();
          }
        });

        // recover color gradually
        app.ticker.add(delta => {
          if (!lastOveredNode) {
            recoverElapsed = 0;
            return;
          }

          const { elapsedMS } = delta;

          recoverElapsed += elapsedMS;

          if (recoverElapsed >= duration) {
            lastOveredNode = null;
            return;
          }

          const alphaVariation = (0.8 / duration) * elapsedMS;

          if (!dragging) {
            drawLines();
          }

          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const circle = circles.children[i];
            const alpha = Math.min(maxAlpha, circle.alpha + alphaVariation);

            // update color: downplay all nodes
            let color = basicColor;
            const fillColor = circle._fillColor || basicColor;
            // update color gradually
            let baseRgbColor = circle._baseRgbColor;
            if (!baseRgbColor) {
              baseRgbColor = hexToRgb(fillColor);
              circle._baseRgbColor = baseRgbColor;
            }

            if (fillColor !== basicColor || node.id === lastOveredNode.id) {
              const rgb = interpolateColor(
                baseRgbColor,
                basicRgbColor,
                recoverElapsed / duration,
              );
              color = rgbToHex(...rgb);
              circle._fillColor = color;
            }

            circle.clear();
            circle.circle(node.x, node.y, radius).fill(color);
            circle.alpha = alpha;
          }

          app.render();
        });
      });

    mountedRef.current = true;
  }, []);

  return <div id="graph-view" />;
}
