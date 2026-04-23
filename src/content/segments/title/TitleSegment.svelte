<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { titleStage } from './stage.svelte';

  let { segmentId = 'title' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, titleStage));
  onDestroy(() => unregisterStage(segmentId));
</script>

<div class="title-root" data-segment-root>
  <div class="title-content">
    <span class="eyebrow">Prof Florian Block</span>
    <h1 class="title-line-1 headline-gradient">Agentic AI</h1>
    <h2 class="title-line-2">for Interactive Media Creation</h2>
    <p class="invitation">Bring your scepticism and your curiosity.</p>
  </div>
</div>

<style>
  .title-root {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 120px 160px;
  }

  /* Each piece fades in with a short stagger on segment entry. */
  .title-content {
    max-width: 1600px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .eyebrow {
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    margin-bottom: 36px;
    opacity: 0;
    animation: fade-up 0.7s ease-out 0.05s forwards;
  }

  .title-line-1 {
    font-family: var(--font-sans);
    font-size: 168px;
    font-weight: 700;
    letter-spacing: -0.035em;
    /* line-height: 1 was cropping descenders on the gradient fill ("g" in
       "Agentic"). Matching the 1.12 / 0.08em pattern used by other h1s. */
    line-height: 1.12;
    margin: 0;
    padding-bottom: 0.1em;
    opacity: 0;
    animation: fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards;
  }

  .title-line-2 {
    font-family: var(--font-sans);
    font-size: 74px;
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.1;
    color: var(--color-text);
    margin: 14px 0 0 0;
    opacity: 0;
    animation: fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.45s forwards;
  }

  .invitation {
    margin-top: 56px;
    font-size: 30px;
    line-height: 1.5;
    color: var(--color-text-muted);
    max-width: 38em;
    opacity: 0;
    animation: fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.75s forwards;
  }

  @keyframes fade-up {
    from {
      opacity: 0;
      transform: translateY(16px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
