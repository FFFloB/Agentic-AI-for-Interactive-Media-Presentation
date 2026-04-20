<script lang="ts">
  import type { Component } from 'svelte';
  import type { PlacedSegment } from '$lib/types';
  import { componentRegistry } from '$content/elements';

  let { placed }: { placed: PlacedSegment[] } = $props();

  let loaded = $state<Record<string, Component<any>>>({});

  async function loadComponent(name: string) {
    if (loaded[name]) return;
    const loader = componentRegistry[name];
    if (!loader) {
      console.warn(`No component registered for: ${name}`);
      return;
    }
    const module = await loader();
    loaded[name] = module.default;
    loaded = { ...loaded };
  }

  $effect(() => {
    for (const s of placed) loadComponent(s.component);
  });
</script>

{#each placed as segment (segment.id)}
  <div
    class="segment"
    style:transform="translate({segment.xOffset}px, 0)"
    style:width="{segment.width}px"
    style:height="{segment.height}px"
  >
    {#if loaded[segment.component]}
      {@const Comp = loaded[segment.component]}
      <Comp segmentId={segment.id} {...(segment.meta ?? {})} />
    {/if}
  </div>
{/each}

<style>
  .segment {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
  }
</style>
