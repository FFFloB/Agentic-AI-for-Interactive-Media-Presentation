<script lang="ts">
  import type { Snippet } from 'svelte';
  import { camera } from './camera.svelte';
  import { STAGE_WIDTH, STAGE_HEIGHT } from '$lib/constants';

  let { children }: { children: Snippet } = $props();

  // Fit the fixed 1920x1080 stage into the real window with proportional
  // contain-fit (letterbox). The stage is always centered; extra space on the
  // shorter axis shows the background canvas behind it.
  let winW = $state(window.innerWidth);
  let winH = $state(window.innerHeight);
  const fitScale = $derived(
    Math.min(winW / STAGE_WIDTH, winH / STAGE_HEIGHT),
  );

  function onResize() {
    winW = window.innerWidth;
    winH = window.innerHeight;
  }
</script>

<svelte:window onresize={onResize} />

<div class="viewport">
  <div
    class="stage"
    style:width="{STAGE_WIDTH}px"
    style:height="{STAGE_HEIGHT}px"
    style:zoom={fitScale}
  >
    <div class="canvas-layer" style:transform={camera.transform}>
      {@render children()}
    </div>
  </div>
</div>

<style>
  /* The viewport uses flexbox to centre the stage rather than using a
     transform, so we can use CSS `zoom` for the fit-scale instead of
     `transform: scale`. `zoom` re-runs layout (instead of rasterising
     at 1x and upscaling the bitmap), so text and SVG inside the stage
     render at the display's native pixel density. The camera layer
     inside still uses transform for animated pans/zooms where GPU
     compositing is the right trade-off. */
  .viewport {
    position: fixed;
    inset: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stage {
    position: relative;
    overflow: hidden;
    flex: 0 0 auto;
  }

  .canvas-layer {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
    will-change: transform;
  }
</style>
