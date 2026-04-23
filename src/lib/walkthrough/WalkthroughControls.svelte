<script lang="ts">
  import { walkthrough } from './walkthrough.svelte';
  import { STAGE_WIDTH, STAGE_HEIGHT } from '$lib/constants';

  // Scale the nav bar with the rest of the stage so it does not look
  // disproportionately large on small windows. Mirrors the fitScale
  // computation in CameraViewport.
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

{#if walkthrough.scripts.length > 0}
  <div class="controls" style:zoom={fitScale}>
    <button
      class="key-cap"
      onclick={() => walkthrough.switchPrev()}
      disabled={!walkthrough.canSwitchPrev}
      aria-label="Previous section"
      title="Previous section (←)"
    >←</button>

    <button
      class="key-cap"
      onclick={() => walkthrough.switchNext()}
      disabled={!walkthrough.canSwitchNext}
      aria-label="Next section"
      title="Next section (→)"
    >→</button>

    <span class="indicator">
      Section {walkthrough.activeIndex + 1} / {walkthrough.scripts.length}
    </span>

    <span class="divider" aria-hidden="true"></span>

    <button
      class="key-cap"
      onclick={() => walkthrough.stepPrev()}
      disabled={!walkthrough.canStepPrev}
      aria-label="Previous step"
      title="Previous step (↑)"
    >↑</button>

    <button
      class="key-cap primary"
      onclick={() => walkthrough.stepNext()}
      disabled={!walkthrough.canStepNext}
      aria-label="Next step"
      title="Next step (↓ / space)"
    >↓</button>

    <span class="indicator">
      Step {Math.max(0, walkthrough.currentIndex + 1)} / {walkthrough.totalSteps}
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
    /* zoom (set inline) re-lays out so text and key-caps render at the
       display's native pixel density, not a scaled-up 1x bitmap. */
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

  /* Keyboard-cap buttons — the four nav buttons visually echo the
     hotkeys (←, ↑, ↓, →). */
  .key-cap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.02)
    );
    color: rgba(255, 255, 255, 0.78);
    font-family: var(--font-mono);
    font-size: 16px;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    transition:
      background 0.12s ease,
      color 0.12s ease,
      border-color 0.12s ease,
      transform 0.08s ease,
      box-shadow 0.08s ease;
    box-shadow:
      inset 0 -2px 0 rgba(0, 0, 0, 0.25),
      0 2px 0 rgba(0, 0, 0, 0.18);
  }

  .key-cap:hover:not(:disabled) {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.16),
      rgba(255, 255, 255, 0.04)
    );
    color: white;
    border-color: rgba(255, 255, 255, 0.32);
  }

  .key-cap:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow:
      inset 0 -1px 0 rgba(0, 0, 0, 0.2),
      0 0 0 rgba(0, 0, 0, 0.15);
  }

  .key-cap:disabled {
    opacity: 0.3;
    cursor: default;
  }

  /* Primary (next step) - the most common action gets a slight lift. */
  .key-cap.primary {
    background: linear-gradient(
      180deg,
      rgba(168, 85, 247, 0.28),
      rgba(168, 85, 247, 0.12)
    );
    border-color: rgba(168, 85, 247, 0.45);
    color: white;
    box-shadow:
      inset 0 -2px 0 rgba(88, 28, 135, 0.5),
      0 2px 0 rgba(0, 0, 0, 0.18),
      0 0 12px -2px rgba(168, 85, 247, 0.35);
  }

  .key-cap.primary:hover:not(:disabled) {
    background: linear-gradient(
      180deg,
      rgba(168, 85, 247, 0.4),
      rgba(168, 85, 247, 0.2)
    );
    border-color: rgba(168, 85, 247, 0.6);
  }

  .indicator {
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    margin-left: 0.25rem;
  }

  .divider {
    width: 1px;
    height: 1.5rem;
    background: rgba(255, 255, 255, 0.12);
    margin: 0 0.25rem;
  }

  .step-label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    margin-left: 0.5rem;
    padding-left: 0.5rem;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    max-width: 18rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
