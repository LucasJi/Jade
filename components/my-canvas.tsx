'use client';

import { useEffect } from 'react';

export function MyCanvas() {
  useEffect(() => {
    console.log(document);
    const canvas: HTMLCanvasElement | null = document.getElementById(
      'tutorial',
    ) as HTMLCanvasElement;

    if (canvas?.getContext) {
      const ctx = canvas.getContext('2d')!;
      console.log('draw');

      ctx.fillStyle = 'rgb(200,0,0)';
      ctx.fillRect(10, 10, 55, 50);

      ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
      ctx.fillRect(30, 30, 55, 50);
    }
    console.log(canvas);
  }, []);

  return (
    <div>
      <canvas id="tutorial" width="150" height="150">
        current stock price: $3.15 +0.15
      </canvas>
    </div>
  );
}
