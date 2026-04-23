import type { BackgroundShape } from '$lib/types';

export interface RenderContext {
  cameraX: number;
  cameraY: number;
  cameraZoom: number;
  width: number;
  height: number;
  // Stage-to-viewport scale. Shape positions, sizes, blurs, and camera parallax
  // offsets are all multiplied by this so the background stays visually
  // consistent across window sizes and aspect ratios.
  fitScale: number;
}

export function renderBackground(
  ctx: CanvasRenderingContext2D,
  shapes: BackgroundShape[],
  rc: RenderContext,
) {
  ctx.clearRect(0, 0, rc.width, rc.height);

  const s = rc.fitScale;

  for (const shape of shapes) {
    const px = shape.x * s - rc.cameraX * shape.parallaxFactor * s + rc.width / 2;
    const py = shape.y * s - rc.cameraY * shape.parallaxFactor * s + rc.height / 2;
    const size = shape.size * s;

    ctx.save();
    ctx.globalAlpha = shape.opacity;

    if (shape.blur) {
      ctx.filter = `blur(${shape.blur * s}px)`;
    }

    switch (shape.type) {
      case 'circle':
        drawCircle(ctx, px, py, size, shape.color);
        break;
      case 'ring':
        drawRing(ctx, px, py, size, shape.color, s);
        break;
      case 'line':
        drawLine(ctx, px, py, size, shape.color, shape.rotation ?? 0, s);
        break;
      case 'blob':
        drawCircle(ctx, px, py, size, shape.color);
        break;
    }

    ctx.restore();
  }
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  scale: number,
) {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  rotation: number,
  scale: number,
) {
  const rad = (rotation * Math.PI) / 180;
  const dx = Math.cos(rad) * size;
  const dy = Math.sin(rad) * size;

  ctx.beginPath();
  ctx.moveTo(x - dx / 2, y - dy / 2);
  ctx.lineTo(x + dx / 2, y + dy / 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();
}
