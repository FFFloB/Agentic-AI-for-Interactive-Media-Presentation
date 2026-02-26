<script lang="ts">
  import { camera } from '$lib/camera/camera.svelte';
  import { renderBackground } from './renderer';
  import { defaultShapes } from './shapes';

  let canvasEl: HTMLCanvasElement;

  $effect(() => {
    const ctx = canvasEl.getContext('2d')!;
    let animationId: number;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvasEl.width = window.innerWidth * dpr;
      canvasEl.height = window.innerHeight * dpr;
      canvasEl.style.width = `${window.innerWidth}px`;
      canvasEl.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize);

    function loop() {
      renderBackground(ctx, defaultShapes, {
        cameraX: camera.x,
        cameraY: camera.y,
        cameraZoom: camera.zoom,
        width: window.innerWidth,
        height: window.innerHeight,
      });
      animationId = requestAnimationFrame(loop);
    }

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  });
</script>

<canvas bind:this={canvasEl} class="background-canvas"></canvas>

<style>
  .background-canvas {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }
</style>
