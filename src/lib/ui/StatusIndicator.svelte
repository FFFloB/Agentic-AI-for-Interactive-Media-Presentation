<script lang="ts">
  // Subtle top-right indicator that reflects what Claude Code is doing in
  // the background, fed by scripts/status-bridge.mjs over SSE. If the
  // bridge isn't running (e.g. the compiled single-file HTML a student
  // opens), the component stays invisible - no broken UI in the wild.

  import { STAGE_WIDTH, STAGE_HEIGHT } from '$lib/constants';

  type Status = 'ready' | 'working' | 'input-needed';

  const BRIDGE_URL = 'http://127.0.0.1:7321/events';

  let connected = $state(false);
  let status = $state<Status>('ready');
  let source: EventSource | null = null;
  let everConnected = false;
  let givenUp = false;

  // Scale the indicator with the rest of the stage, matching the nav bar.
  let winW = $state(window.innerWidth);
  let winH = $state(window.innerHeight);
  const fitScale = $derived(
    Math.min(winW / STAGE_WIDTH, winH / STAGE_HEIGHT),
  );

  function onResize() {
    winW = window.innerWidth;
    winH = window.innerHeight;
  }

  const LABELS: Record<Status, string> = {
    'ready': 'ready',
    'working': 'working',
    'input-needed': 'input needed'
  };

  // Sprinkler burst: a rotating emitter drops particles over ~1.4s. Each
  // particle's `angle` and `delay` advance together so they appear as a
  // single nozzle sweeping ~2 full rotations. Sizes, distances and
  // lifetimes are varied with small deterministic jitter for organic feel.
  const PARTICLES = (() => {
    const count = 60;
    const totalSpin = 1080;  // deg of nozzle rotation over the emit window (3 revs)
    const emitMs = 1400;
    return Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      const r = (i * 7919) % 1000 / 1000;
      const size = r < 0.55 ? 3 : r < 0.85 ? 5 : 7;
      const jitter = ((i * 47) % 24) - 12;
      return {
        angle: totalSpin * t + jitter,
        size,
        dist: 38 + ((i * 13) % 58),
        delay: Math.round(emitMs * t),
        life: 720 + ((i * 29) % 360)
      };
    });
  })();

  // Trigger the ready-burst whenever status transitions INTO 'ready' from
  // anywhere else. `prevStatus` is a plain let (not $state) so the effect
  // only re-runs when `status` changes, avoiding a reactivity loop.
  let prevStatus: Status = 'ready';
  let burstId = $state(0);

  $effect(() => {
    if (status === 'ready' && prevStatus !== 'ready') {
      burstId += 1;
    }
    prevStatus = status;
  });

  // Dev hotkey: press P to replay the ready-burst for visual inspection.
  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'p' && e.key !== 'P') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    burstId += 1;
  }

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

<svelte:window onresize={onResize} onkeydown={handleKeydown} />

{#if connected}
  <div
    class="status-indicator"
    data-status={status}
    style:zoom={fitScale}
    aria-live="polite"
  >
    <span class="ai-mark" aria-hidden="true">
      <span class="trail"></span>
      <svg class="mark-svg" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="ai-mark-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" class="mark-stop-from" />
            <stop offset="100%" class="mark-stop-to" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill="url(#ai-mark-grad)" />
        <path
          d="M12 5 L13.2 10.8 L19 12 L13.2 13.2 L12 19 L10.8 13.2 L5 12 L10.8 10.8 Z"
          fill="#fff"
        />
      </svg>
      {#key burstId}
        {#if burstId > 0}
          <span class="burst">
            {#each PARTICLES as p}
              <span
                class="particle"
                style="--angle: {p.angle}deg; --dist: {p.dist}px; --size: {p.size}px; --delay: {p.delay}ms; --life: {p.life}ms;"
              ></span>
            {/each}
          </span>
        {/if}
      {/key}
    </span>
    <span class="label">{LABELS[status]}</span>
  </div>
{/if}

<style>
  .status-indicator {
    position: fixed;
    top: 24px;
    right: 24px;
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 6px 22px 6px 6px;
    border-radius: 9999px;
    background: rgba(0, 0, 0, 0.42);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 13px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.62);
    z-index: 1000;
    pointer-events: none;
    user-select: none;
    transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
    animation: si-fade-in 0.4s ease-out;
  }

  .ai-mark {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    filter: drop-shadow(0 0 8px var(--mark-glow, rgba(16, 185, 129, 0.5)));
    transition: filter 0.3s ease;
  }

  .mark-svg {
    position: relative;
    z-index: 1;
    width: 40px;
    height: 40px;
  }

  /* Rotating trail: a conic-gradient ring masked to the outer edge of the
     AI disc, rotating clockwise. Head (bright) + fading tail gives the
     illusion of a dot sweeping around the circular path. Only visible
     while working. */
  .trail {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      transparent 200deg,
      rgba(255, 255, 255, 0.18) 270deg,
      rgba(255, 255, 255, 0.55) 335deg,
      rgba(255, 255, 255, 0.95) 359deg,
      transparent 360deg
    );
    mask: radial-gradient(circle, transparent 62%, #000 68%, #000 92%, transparent 100%);
    -webkit-mask: radial-gradient(circle, transparent 62%, #000 68%, #000 92%, transparent 100%);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
  }

  /* The gradient stops are driven by CSS custom properties so the AI mark
     recolors with the current status and doubles as the state indicator. */
  :global(.mark-stop-from) {
    stop-color: var(--mark-from, #34d399);
    transition: stop-color 0.3s ease;
  }
  :global(.mark-stop-to) {
    stop-color: var(--mark-to, #059669);
    transition: stop-color 0.3s ease;
  }

  /* Ready: calm green, no motion. */
  .status-indicator[data-status='ready'] {
    --mark-from: #34d399;
    --mark-to: #059669;
    --mark-glow: rgba(16, 185, 129, 0.5);
  }

  /* Working: amber, subtle clockwise dot+trail sweeping around the disc. */
  .status-indicator[data-status='working'] {
    --mark-from: #fbbf24;
    --mark-to: #d97706;
    --mark-glow: rgba(245, 158, 11, 0.6);
    color: rgba(255, 255, 255, 0.78);
  }
  .status-indicator[data-status='working'] .trail {
    opacity: 1;
    animation: trail-spin 2.2s linear infinite;
  }

  /* Input needed: pink, urgent pulse + border accent so it catches the eye. */
  .status-indicator[data-status='input-needed'] {
    --mark-from: #f472b6;
    --mark-to: #db2777;
    --mark-glow: rgba(236, 72, 153, 0.75);
    color: #fff;
    border-color: rgba(236, 72, 153, 0.55);
    background: rgba(48, 10, 30, 0.55);
  }
  .status-indicator[data-status='input-needed'] .ai-mark {
    animation: si-pulse-fast 0.9s ease-in-out infinite;
  }

  @keyframes trail-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @keyframes si-pulse-fast {
    0%, 100% {
      transform: scale(1);
      filter: drop-shadow(0 0 6px var(--mark-glow));
    }
    50% {
      transform: scale(1.2);
      filter: drop-shadow(0 0 18px var(--mark-glow));
    }
  }

  /* Sprinkler burst: rotating-emitter particle spray fired on transition
     into ready. Overflows the mark; pointer-events off so it's inert. */
  .burst {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    overflow: visible;
  }

  .particle {
    --angle: 0deg;
    --dist: 60px;
    --size: 4px;
    --delay: 0ms;
    --life: 900ms;
    position: absolute;
    left: 50%;
    top: 50%;
    width: var(--size);
    height: var(--size);
    margin: calc(var(--size) / -2) 0 0 calc(var(--size) / -2);
    border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 8px rgba(52, 211, 153, 0.85);
    opacity: 0;
    animation: burst-particle var(--life) ease-out var(--delay) forwards;
  }

  @keyframes burst-particle {
    0% {
      opacity: 0;
      transform: rotate(var(--angle)) translateX(12px) scale(0.3);
    }
    12% {
      opacity: 1;
      transform: rotate(var(--angle)) translateX(18px) scale(1);
    }
    100% {
      opacity: 0;
      transform: rotate(var(--angle)) translateX(var(--dist)) scale(0.2);
    }
  }

  @keyframes si-fade-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
