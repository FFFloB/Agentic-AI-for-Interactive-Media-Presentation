<script lang="ts">
  let { isFocused = false }: { isFocused?: boolean } = $props();

  let counter = $state(0);
  let dots = $state<{ x: number; y: number; hue: number }[]>([]);

  function addDot(e: MouseEvent) {
    if (!isFocused) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dots = [
      ...dots,
      {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        hue: (counter * 30) % 360,
      },
    ];
    counter++;
  }
</script>

<div class="demo-slide" class:focused={isFocused} onclick={addDot} role="presentation">
  <h2>Interactive Demo</h2>
  <p class="hint">
    {#if isFocused}
      Click anywhere to place dots — this is a live interactive component.
    {:else}
      Click to expand and interact
    {/if}
  </p>

  {#if isFocused}
    <div class="canvas-area">
      {#each dots as dot}
        <div
          class="dot"
          style:left="{dot.x}px"
          style:top="{dot.y}px"
          style:background="hsl({dot.hue}, 70%, 60%)"
        ></div>
      {/each}
      {#if dots.length > 0}
        <span class="counter">{dots.length} dot{dots.length !== 1 ? 's' : ''}</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .demo-slide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    padding: 2rem;
    text-align: center;
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .focused h2 {
    font-size: 2.5rem;
  }

  .hint {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .canvas-area {
    position: relative;
    width: 100%;
    flex: 1;
    min-height: 300px;
    margin-top: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .dot {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: pop 0.2s ease-out;
  }

  @keyframes pop {
    0% {
      transform: translate(-50%, -50%) scale(0);
    }
    70% {
      transform: translate(-50%, -50%) scale(1.3);
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
    }
  }

  .counter {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }
</style>
