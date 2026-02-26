<script lang="ts">
  import type { Component } from 'svelte';
  import { focusState } from './focus.svelte';
  import { componentRegistry } from '$content/elements';
  import { elements } from '$content/slides.config';

  let loadedComponent = $state<Component<any> | null>(null);

  $effect(() => {
    if (!focusState.activeId) {
      loadedComponent = null;
      return;
    }

    const elConfig = elements.find((e) => e.id === focusState.activeId);
    if (!elConfig) return;

    const componentName = elConfig.focusComponent ?? elConfig.component;
    const loader = componentRegistry[componentName];
    if (!loader) return;

    loader().then((mod) => {
      loadedComponent = mod.default;
    });
  });

  function handleClose() {
    focusState.unfocus();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if focusState.activeId}
  <div
    class="focus-overlay"
    class:transitioning={focusState.isTransitioning}
    class:active={focusState.isFocused}
  >
    <button class="close-btn" onclick={handleClose} aria-label="Close">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>

    <div class="focus-content">
      {#if loadedComponent}
        {@const Comp = loadedComponent}
        <Comp isFocused={true} />
      {/if}
    </div>
  </div>
{/if}

<style>
  .focus-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgba(10, 10, 15, 0.95);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .focus-overlay.active {
    opacity: 1;
  }

  .focus-overlay.transitioning {
    pointer-events: none;
  }

  .close-btn {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.15s ease;
    z-index: 51;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .focus-content {
    width: 100%;
    height: 100%;
    max-width: 1200px;
    max-height: 90vh;
    padding: 3rem;
    overflow: auto;
  }
</style>
