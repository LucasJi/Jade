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

const hexToRgb = hex => {
  const bigint = parseInt(String(hex).slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
};

const rgbToHex = (r, g, b) => (r << 16) | (g << 8) | b;

const width = 600,
  height = 600,
  lineWidth = 0.2,
  basicCircleRgbColor = [92, 92, 92],
  basicCircleColor = rgbToHex(...basicCircleRgbColor),
  basicLineRgbColor = [230, 230, 230],
  basicLineColor = rgbToHex(...basicLineRgbColor),
  nohlCircleColor = '#DFDFDF',
  nohlCircleRgbColor = [222, 222, 222],
  nohlLineRgbColor = [240, 240, 240],
  nohlLineColor = rgbToHex(...nohlLineRgbColor),
  hlColor = '#A88BFA',
  hlRgbColor = [133, 106, 234],
  duration = 600, // Duration in milliseconds
  minAlpha = 0.2,
  maxAlpha = 1,
  radius = 5;

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
        .force(
          'collision',
          forceCollide()
            .radius(radius * 1.2)
            .iterations(2),
        );

    let transform = zoomIdentity.translate(width / 2, height / 2),
      overElapsed = 0,
      overLoop = 0,
      outElapsed = 0,
      outLoop = 0,
      overedNode = null,
      lastOveredNode = null,
      simulating = false,
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

      dragging = true;

      clearCirclesBaseRgbColor();
      overElapsed = 0;
      overedNode = nodes[event.subject.index];
      lastOveredNode = null;
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

      dragging = false;

      clearCirclesBaseRgbColor();
      outElapsed = 0;
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

      for (const link of links) {
        lines.moveTo(link.source.x, link.source.y);
        lines.lineTo(link.target.x, link.target.y);

        if (overedNode) {
          lines.stroke({
            width: lineWidth,
            color: link.source._lineColor || basicLineColor,
          });
        } else if (lastOveredNode) {
          lines.stroke({
            width: lineWidth,
            color: link.source._lineColor || basicLineColor,
          });
        } else {
          lines.stroke({
            width: lineWidth,
            color: basicLineColor,
          });
        }
      }
    };

    const clearCirclesBaseRgbColor = () => {
      circles.children.forEach(child => {
        if (child._baseRgbColor) {
          delete child._baseRgbColor;
        }

        if (child._baseLineRgbColor) {
          delete child._baseLineRgbColor;
        }
      });
    };

    app
      .init({
        width,
        height,
        autoDensity: true,
        resolution: 2,
        hello: true,
        background: 'white',
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
              .fill({ color, alpha: maxAlpha });
            circle.id = node.id;

            // accept events, trigger hover status
            circle.eventMode = 'static';
            circle.cursor = 'pointer';

            // events
            circle
              .on('pointerover', function () {
                if (!dragging) {
                  clearCirclesBaseRgbColor();
                  overElapsed = 0;
                  overedNode = node;
                  lastOveredNode = null;
                  outLoop = 0;
                }
              })
              .on('pointerout', function () {
                if (!dragging) {
                  clearCirclesBaseRgbColor();
                  outElapsed = 0;
                  overedNode = null;
                  lastOveredNode = node;
                  overLoop = 0;
                }
              });

            circles.addChild(circle);
          }
        };

        drawCircles(basicCircleColor);

        simulation
          .on('tick', function () {
            simulating = true;
            drawLines();
          })
          .on('end', () => {
            simulating = false;
          })
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
            return;
          }

          const { elapsedMS } = delta;

          overElapsed += elapsedMS;

          if (overElapsed < 60 || overLoop > 9) {
            return;
          }

          overLoop += 1;

          if (!simulating) {
            drawLines();
          }

          const factor = overLoop / 10;

          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const circle = circles.children[i];

            let circleColor = basicCircleRgbColor;
            const fillColor = circle._fillColor || basicCircleRgbColor;
            const lineColor = circle._lineColor || basicLineRgbColor;

            let baseRgbColor = circle._baseRgbColor;
            if (!baseRgbColor) {
              baseRgbColor = fillColor;
              circle._baseRgbColor = baseRgbColor;
            }

            let baseLineRgbColor = circle._baseLineRgbColor;
            if (!baseLineRgbColor) {
              baseLineRgbColor = lineColor;
              circle._baseLineRgbColor = baseLineRgbColor;
            }

            let targetRgbColor;
            let targetLineRgbColor;
            if (node.id === overedNode.id) {
              targetRgbColor = hlRgbColor;
              targetLineRgbColor = hlRgbColor;
            } else if (overedNode.forwardLinks.includes(node.id)) {
              targetRgbColor = basicCircleRgbColor;
              targetLineRgbColor = basicLineRgbColor;
            } else {
              targetRgbColor = nohlCircleRgbColor;
              targetLineRgbColor = nohlLineRgbColor;
            }

            circleColor = interpolateColor(
              baseRgbColor,
              targetRgbColor,
              factor,
            );
            circle._fillColor = circleColor;
            circle._lineColor = interpolateColor(
              baseLineRgbColor,
              targetLineRgbColor,
              factor,
            );

            circle.clear();
            circle
              .circle(node.x, node.y, radius)
              .fill(rgbToHex(...circleColor));
          }

          overElapsed = 0;
        });

        // recover color gradually
        app.ticker.add(delta => {
          if (!lastOveredNode) {
            return;
          }

          const { elapsedMS } = delta;

          outElapsed += elapsedMS;

          if (outElapsed < 60 || outLoop > 9) {
            return;
          }

          outLoop += 1;

          if (!simulating) {
            drawLines();
          }

          const factor = outLoop / 10;

          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const circle = circles.children[i];

            let color = basicCircleRgbColor;
            const fillColor = circle._fillColor || basicCircleRgbColor;
            const lineColor = circle._lineColor || basicLineRgbColor;

            let baseRgbColor = circle._baseRgbColor;
            if (!baseRgbColor) {
              baseRgbColor = fillColor;
              circle._baseRgbColor = baseRgbColor;
            }

            let baseLineRgbColor = circle._baseLineRgbColor;
            if (!baseLineRgbColor) {
              baseLineRgbColor = lineColor;
              circle._baseLineRgbColor = baseLineRgbColor;
            }

            color = interpolateColor(baseRgbColor, basicCircleRgbColor, factor);
            circle._fillColor = color;
            circle._lineColor = interpolateColor(
              baseLineRgbColor,
              basicLineRgbColor,
              factor,
            );

            circle.clear();
            circle.circle(node.x, node.y, radius).fill(rgbToHex(...color));
          }

          outElapsed = 0;
        });
      });

    mountedRef.current = true;
  }, []);

  return <div id="graph-view" className="bg-white" />;
}
