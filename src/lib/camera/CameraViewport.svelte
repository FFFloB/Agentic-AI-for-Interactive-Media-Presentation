<script lang="ts">
  import type { Snippet } from 'svelte';
  import { camera } from './camera.svelte';

  let { children }: { children: Snippet } = $props();

  function onResize() {
    camera.updateViewport(window.innerWidth, window.innerHeight);
  }
</script>

<svelte:window onresize={onResize} />

<div class="viewport">
  <div class="canvas-layer" style:transform={camera.transform}>
    {@render children()}
  </div>
</div>

<style>
  .viewport {
    position: fixed;
    inset: 0;
    overflow: hidden;
  }

  .canvas-layer {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
    will-change: transform;
  }
</style>
