<script lang="ts">
  // Single toggle button that morphs between "open workspace" (folder
  // glyph) and "close workspace" (X glyph) based on state. Always
  // rendered in the same HUD-corner slot so the open/close action
  // feels like one affordance, not two separate buttons.

  import { workspace } from './workspace.svelte';

  const showBadge = $derived(!workspace.isOpen && workspace.changeCount > 0);
</script>

{#if workspace.bridgeAvailable}
  <div class="fab-wrap">
    <button
      class="fab"
      class:is-open={workspace.isOpen}
      onclick={() => workspace.toggle()}
      aria-label={workspace.isOpen ? 'Close workspace' : 'Open workspace'}
      aria-pressed={workspace.isOpen}
      title={workspace.isOpen ? 'Close workspace (Esc)' : 'Open workspace'}
    >
      <span class="icon icon-folder" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26">
          <path d="M4 5h5l2 2h9a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="icon icon-close" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M6 6l12 12M6 18L18 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </span>
    </button>

    {#if showBadge}
      <span class="badge" aria-label={`${workspace.changeCount} new changes`}>
        {workspace.changeCount > 99 ? '99+' : workspace.changeCount}
      </span>
    {/if}
  </div>
{/if}

<style>
  .fab-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .fab {
    position: relative;
    /* Matches the AI mark inside the status pill (48x48). */
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.42);
    border: 1px solid rgba(20, 184, 166, 0.4);
    color: #14b8a6;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
    pointer-events: auto;
    transition: transform 180ms cubic-bezier(0.2, 0.9, 0.3, 1.2),
                background 220ms ease,
                border-color 220ms ease,
                color 220ms ease;
    overflow: hidden;
  }
  .fab:hover {
    background: rgba(20, 184, 166, 0.22);
    border-color: rgba(20, 184, 166, 0.7);
    transform: scale(1.05);
  }
  .fab:active { transform: scale(0.94); }
  .fab.is-open {
    background: rgba(0, 0, 0, 0.55);
    border-color: rgba(255, 255, 255, 0.22);
    color: #ffffff;
  }
  .fab.is-open:hover {
    background: rgba(239, 68, 68, 0.24);
    border-color: rgba(239, 68, 68, 0.55);
  }

  /* Both icons are stacked and cross-fade with a small rotation so the
     swap reads as one glyph morphing, not two separate buttons. */
  .icon {
    position: absolute;
    inset: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: opacity 220ms ease, transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
  }
  .icon-folder {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
  .icon-close {
    opacity: 0;
    transform: rotate(-60deg) scale(0.7);
  }
  .fab.is-open .icon-folder {
    opacity: 0;
    transform: rotate(60deg) scale(0.7);
  }
  .fab.is-open .icon-close {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }

  .badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    border-radius: 999px;
    background: #ef4444;
    color: #ffffff;
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.6), 0 0 0 2px rgba(0, 0, 0, 0.42);
    pointer-events: none;
    animation: badge-pop 280ms cubic-bezier(0.2, 0.9, 0.3, 1.3);
  }

  @keyframes badge-pop {
    0% { transform: scale(0.4); opacity: 0; }
    70% { transform: scale(1.15); opacity: 1; }
    100% { transform: scale(1); }
  }
</style>
