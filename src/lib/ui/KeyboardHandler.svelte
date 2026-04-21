<script lang="ts">
  import { walkthrough } from '$lib/walkthrough/walkthrough.svelte';

  // Digit-input jump: typing a number buffers it. 1s after the last
  // keystroke, the buffer is committed as a 1-indexed segment number
  // and the camera jumps there. Any non-digit keystroke cancels the
  // pending jump so arrow nav doesn't get mixed up with a typed number.
  const JUMP_TIMEOUT_MS = 1000;
  let jumpBuffer = $state('');
  let jumpTimer: number | null = null;

  function commitJump() {
    const n = parseInt(jumpBuffer, 10);
    jumpBuffer = '';
    jumpTimer = null;
    if (!Number.isFinite(n) || n < 1) return;
    walkthrough.jumpTo(n - 1);
  }

  function cancelJump() {
    jumpBuffer = '';
    if (jumpTimer != null) {
      clearTimeout(jumpTimer);
      jumpTimer = null;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    // Swallow digits into the jump buffer and (re)start the debounce.
    if (/^[0-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      jumpBuffer += e.key;
      if (jumpTimer != null) clearTimeout(jumpTimer);
      jumpTimer = window.setTimeout(commitJump, JUMP_TIMEOUT_MS);
      return;
    }

    // Any other key aborts a pending jump so it doesn't fire later.
    cancelJump();

    switch (e.key) {
      // Within-segment progression
      case 'ArrowDown':
      case ' ':
      case 'Enter':
      case 'PageDown':
        e.preventDefault();
        walkthrough.stepNext();
        break;
      case 'ArrowUp':
      case 'Backspace':
      case 'PageUp':
        e.preventDefault();
        walkthrough.stepPrev();
        break;

      // Cross-segment navigation
      case 'ArrowRight':
        e.preventDefault();
        walkthrough.switchNext();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        walkthrough.switchPrev();
        break;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Small on-screen hint showing the pending jump target. Fades in when
     digits are being buffered; the window timeout commits + clears it. -->
{#if jumpBuffer}
  <div class="jump-hint">
    <span class="jh-arrow">→</span>
    <span class="jh-label">segment</span>
    <span class="jh-num">{jumpBuffer}</span>
  </div>
{/if}

<style>
  .jump-hint {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 12px 22px;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.72);
    border: 1px solid rgba(236, 72, 153, 0.45);
    box-shadow: 0 12px 40px -12px rgba(236, 72, 153, 0.5);
    backdrop-filter: blur(8px);
    z-index: 1000;
    pointer-events: none;
    animation: fade-up 0.18s ease-out;
  }

  .jh-arrow {
    color: #ec4899;
    font-size: 18px;
  }

  .jh-label {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 13px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
  }

  .jh-num {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 22px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.04em;
    min-width: 24px;
    text-align: center;
  }

  @keyframes fade-up {
    from {
      opacity: 0;
      transform: translate(-50%, 6px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
</style>
