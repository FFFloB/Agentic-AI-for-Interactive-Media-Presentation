import type { BackgroundShape } from '$lib/types';

export interface RenderContext {
  cameraX: number;
  cameraY: number;
  cameraZoom: number;
  width: number;
  height: number;
}

export function renderBackground(
  ctx: CanvasRenderingContext2D,
  shapes: BackgroundShape[],
  rc: RenderContext,
) {
  ctx.clearRect(0, 0, rc.width, rc.height);

  for (const shape of shapes) {
    const px = shape.x - rc.cameraX * shape.parallaxFactor + rc.width / 2;
    const py = shape.y - rc.cameraY * shape.parallaxFactor + rc.height / 2;

    ctx.save();
    ctx.globalAlpha = shape.opacity;

    if (shape.blur) {
      ctx.filter = `blur(${shape.blur}px)`;
    }

    switch (shape.type) {
      case 'circle':
        drawCircle(ctx, px, py, shape.size, shape.color);
        break;
      case 'ring':
        drawRing(ctx, px, py, shape.size, shape.color);
        break;
      case 'line':
        drawLine(ctx, px, py, shape.size, shape.color, shape.rotation ?? 0);
        break;
      case 'blob':
        drawCircle(ctx, px, py, shape.size, shape.color);
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
) {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  rotation: number,
) {
  const rad = (rotation * Math.PI) / 180;
  const dx = Math.cos(rad) * size;
  const dy = Math.sin(rad) * size;

  ctx.beginPath();
  ctx.moveTo(x - dx / 2, y - dy / 2);
  ctx.lineTo(x + dx / 2, y + dy / 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}
