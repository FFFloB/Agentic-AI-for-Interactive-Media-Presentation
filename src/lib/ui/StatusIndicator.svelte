<script lang="ts">
  // Subtle top-right indicator that reflects what Claude Code is doing in
  // the background, fed by scripts/status-bridge.mjs over SSE. If the
  // bridge isn't running (e.g. the compiled single-file HTML a student
  // opens), the component stays invisible - no broken UI in the wild.

  type Status = 'ready' | 'working' | 'input-needed';

  const BRIDGE_URL = 'http://127.0.0.1:7321/events';

  let connected = $state(false);
  let status = $state<Status>('ready');
  let source: EventSource | null = null;
  let everConnected = false;
  let givenUp = false;

  const LABELS: Record<Status, string> = {
    'ready': 'ready',
    'working': 'working',
    'input-needed': 'input needed'
  };

  function connect() {
    try {
      source = new EventSource(BRIDGE_URL);
    } catch {
      return;
    }
    source.onopen = () => {
      connected = true;
      everConnected = true;
    };
    source.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg && typeof msg.status === 'string') {
          if (msg.status === 'ready' || msg.status === 'working' || msg.status === 'input-needed') {
            status = msg.status;
            connected = true;
            everConnected = true;
          }
        }
      } catch { /* ignore malformed */ }
    };
    // Hide on error. If we never reached the bridge at all, give up after
    // the first failure so the compiled single-file build doesn't spam
    // connection attempts on a student's machine. Once we've connected at
    // least once, EventSource's built-in reconnect is fine.
    source.onerror = () => {
      connected = false;
      if (!everConnected && !givenUp) {
        givenUp = true;
        source?.close();
        source = null;
      }
    };
  }

  $effect(() => {
    connect();
    return () => {
      source?.close();
      source = null;
    };
  });
</script>

{#if connected}
  <div class="status-indicator" data-status={status} aria-live="polite">
    <span class="dot"></span>
    <span class="label">{LABELS[status]}</span>
  </div>
{/if}

<style>
  .status-indicator {
    position: fixed;
    top: 20px;
    right: 20px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 6px 12px 6px 10px;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.42);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.62);
    z-index: 1000;
    pointer-events: none;
    user-select: none;
    transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
    animation: si-fade-in 0.4s ease-out;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--dot-color, #10b981);
    box-shadow: 0 0 0 0 var(--dot-glow, rgba(16, 185, 129, 0.4));
    transition: background 0.3s ease;
  }

  /* Ready: calm green, no motion. */
  .status-indicator[data-status='ready'] {
    --dot-color: #10b981;
  }

  /* Working: amber, slow breathing pulse. */
  .status-indicator[data-status='working'] {
    --dot-color: #f59e0b;
    --dot-glow: rgba(245, 158, 11, 0.55);
    color: rgba(255, 255, 255, 0.78);
  }
  .status-indicator[data-status='working'] .dot {
    animation: si-pulse-slow 2.2s ease-in-out infinite;
  }

  /* Input needed: pink, urgent pulse + border accent so it catches the eye. */
  .status-indicator[data-status='input-needed'] {
    --dot-color: #ec4899;
    --dot-glow: rgba(236, 72, 153, 0.7);
    color: #fff;
    border-color: rgba(236, 72, 153, 0.55);
    background: rgba(48, 10, 30, 0.55);
  }
  .status-indicator[data-status='input-needed'] .dot {
    animation: si-pulse-fast 0.9s ease-in-out infinite;
  }

  @keyframes si-pulse-slow {
    0%, 100% {
      box-shadow: 0 0 0 0 var(--dot-glow);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 0 6px rgba(0, 0, 0, 0);
      transform: scale(1.15);
    }
  }

  @keyframes si-pulse-fast {
    0%, 100% {
      box-shadow: 0 0 0 0 var(--dot-glow);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 0 8px rgba(0, 0, 0, 0);
      transform: scale(1.35);
    }
  }

  @keyframes si-fade-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
