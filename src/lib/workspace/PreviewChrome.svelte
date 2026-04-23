<script lang="ts">
  // Shared toolbar above every previewer: a faux address bar with the
  // file's URL/path and a reload button. Keeps visual language consistent
  // across HTML, Markdown, and the live-app phone simulator.

  type Props = {
    url: string;
    live?: boolean;
    onReload: () => void;
  };

  let { url, live = false, onReload }: Props = $props();
</script>

<div class="toolbar">
  <span class="addr">
    <span class="dot" class:live></span>
    {url}
  </span>
  <button class="tool-btn" onclick={onReload} aria-label="Reload" title="Reload">
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="M12 4a8 8 0 1 0 6.93 12h-2.37a6 6 0 1 1-.86-8.14L14 10h6V4l-1.93 1.93A8 8 0 0 0 12 4z" fill="currentColor"/>
    </svg>
    Reload
  </button>
</div>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    max-width: 900px;
    padding: 5px 10px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 11px;
    color: #a0a0a0;
    flex-shrink: 0;
    box-sizing: border-box;
  }
  .addr {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    letter-spacing: 0.02em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #6b7280;
    flex-shrink: 0;
  }
  .dot.live {
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
    animation: live-pulse 1.8s ease-in-out infinite;
  }
  @keyframes live-pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }
  .tool-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #d0d0d0;
    font-family: inherit;
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 120ms ease;
  }
  .tool-btn:hover { background: rgba(255, 255, 255, 0.12); }
</style>
