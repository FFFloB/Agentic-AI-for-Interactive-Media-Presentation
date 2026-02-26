<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { CanvasElementConfig } from '$lib/types';
  import { focusState } from '$lib/focus/focus.svelte';

  let {
    config,
    children,
  }: {
    config: CanvasElementConfig;
    children: Snippet;
  } = $props();

  let elementRef: HTMLDivElement;

  function handleClick() {
    const rect = elementRef.getBoundingClientRect();
    focusState.focusOn(config.id, rect);
  }
</script>

<div
  bind:this={elementRef}
  class="canvas-element"
  style:transform="translate({config.x}px, {config.y}px) scale({config.scale})"
  style:width="{config.width}px"
  style:height="{config.height}px"
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
  role="button"
  tabindex="0"
  aria-label={config.label ?? config.id}
>
  {@render children()}
</div>

<style>
  .canvas-element {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
    cursor: pointer;
    transition: box-shadow 0.2s ease;
  }

  .canvas-element:hover {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15);
    border-radius: 8px;
  }
</style>
