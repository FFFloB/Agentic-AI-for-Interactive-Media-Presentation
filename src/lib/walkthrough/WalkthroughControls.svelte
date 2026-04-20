<script lang="ts">
  import { walkthrough } from './walkthrough.svelte';
</script>

{#if walkthrough.scripts.length > 0}
  <div class="controls">
    <button
      class="control-btn seg-btn"
      onclick={() => walkthrough.switchPrev()}
      disabled={!walkthrough.canSwitchPrev}
      aria-label="Previous segment"
      title="Previous segment (←)"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M13 12L8 8l5-4M7 12L3 8l4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <button
      class="control-btn"
      onclick={() => walkthrough.stepPrev()}
      disabled={!walkthrough.canStepPrev}
      aria-label="Previous step"
      title="Previous step (↑)"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <button
      class="control-btn next-btn"
      onclick={() => walkthrough.stepNext()}
      disabled={!walkthrough.canStepNext}
      aria-label="Next step"
      title="Next step (↓ / space)"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <button
      class="control-btn seg-btn"
      onclick={() => walkthrough.switchNext()}
      disabled={!walkthrough.canSwitchNext}
      aria-label="Next segment"
      title="Next segment (→)"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 4l4 4-4 4M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <span class="seg-indicator">
      seg {walkthrough.activeIndex + 1} / {walkthrough.scripts.length}
    </span>

    <span class="step-indicator">
      {Math.max(0, walkthrough.currentIndex + 1)} / {walkthrough.totalSteps}
    </span>

    {#if walkthrough.currentStep?.label}
      <span class="step-label">{walkthrough.currentStep.label}</span>
    {/if}
  </div>
{/if}

<style>
  .controls {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(10, 10, 20, 0.6);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    z-index: 100;
    font-family: var(--font-sans);
  }

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: rgba(255, 255, 255, 0.75);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .control-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .control-btn:disabled {
    opacity: 0.25;
    cursor: default;
  }

  .next-btn {
    background: rgba(255, 255, 255, 0.08);
  }

  .seg-btn {
    color: rgba(255, 255, 255, 0.55);
  }

  .seg-indicator,
  .step-indicator {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    font-family: var(--font-mono);
  }

  .seg-indicator {
    margin-left: 0.5rem;
  }

  .step-indicator {
    padding-left: 0.5rem;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
  }

  .step-label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    margin-left: 0.25rem;
    max-width: 18rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
