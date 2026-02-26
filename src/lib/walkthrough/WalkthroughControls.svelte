<script lang="ts">
  import { walkthrough } from './walkthrough.svelte';

  function togglePlay() {
    if (walkthrough.isPlaying) {
      walkthrough.pause();
    } else {
      walkthrough.play();
    }
  }
</script>

{#if walkthrough.totalSteps > 0}
  <div class="controls">
    <button
      class="control-btn"
      onclick={() => walkthrough.prev()}
      disabled={!walkthrough.canGoPrev}
      aria-label="Previous step"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <button class="control-btn play-btn" onclick={togglePlay} aria-label={walkthrough.isPlaying ? 'Pause' : 'Play'}>
      {#if walkthrough.isPlaying}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect x="4" y="3" width="3" height="10" rx="0.5"/>
          <rect x="9" y="3" width="3" height="10" rx="0.5"/>
        </svg>
      {:else}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5 3l8 5-8 5V3z"/>
        </svg>
      {/if}
    </button>

    <button
      class="control-btn"
      onclick={() => walkthrough.next()}
      disabled={!walkthrough.canGoNext}
      aria-label="Next step"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <span class="step-indicator">
      {walkthrough.currentIndex + 1} / {walkthrough.totalSteps}
    </span>

    {#if walkthrough.currentStep?.label}
      <span class="step-label">{walkthrough.currentStep.label}</span>
    {/if}
  </div>
{/if}

<style>
  .controls {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
    z-index: 100;
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
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .control-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .control-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .play-btn {
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(255, 255, 255, 0.1);
  }

  .step-indicator {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    margin-left: 0.5rem;
  }

  .step-label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    margin-left: 0.25rem;
  }
</style>
