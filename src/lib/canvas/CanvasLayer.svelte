<script lang="ts">
  import type { Component } from 'svelte';
  import type { CanvasElementConfig } from '$lib/types';
  import { componentRegistry } from '$content/elements';
  import CanvasElement from './CanvasElement.svelte';

  let { elements }: { elements: CanvasElementConfig[] } = $props();

  let loadedComponents = $state<Record<string, Component<any>>>({});

  async function loadComponent(name: string) {
    if (loadedComponents[name]) return;
    const loader = componentRegistry[name];
    if (!loader) {
      console.warn(`No component registered for: ${name}`);
      return;
    }
    const module = await loader();
    loadedComponents[name] = module.default;
    loadedComponents = { ...loadedComponents };
  }

  $effect(() => {
    for (const el of elements) {
      loadComponent(el.component);
    }
  });
</script>

{#each elements as config (config.id)}
  <CanvasElement {config}>
    {#if loadedComponents[config.component]}
      {@const Comp = loadedComponents[config.component]}
      <Comp {...config.meta ?? {}} />
    {:else}
      <div class="loading-placeholder">Loading...</div>
    {/if}
  </CanvasElement>
{/each}

<style>
  .loading-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.875rem;
  }
</style>
