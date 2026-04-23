<script lang="ts">
  import { onMount } from 'svelte';
  import { workspace } from './workspace.svelte';
  import FileTree from './FileTree.svelte';
  import Preview from './Preview.svelte';

  onMount(() => {
    workspace.init();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !workspace.isOpen) return;
      workspace.close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      workspace.teardown();
    };
  });

  // Circular-reveal transition. The panel is clipped to a circle whose
  // radius animates from 0 (button-sized) to 160vmax (well beyond the
  // viewport) and back. Origin is the FAB's approximate centre: its
  // wrapper sits at top: 24px, right: 24px in the HUD corner, and the
  // button itself is 48px, so the centre is (100% - 48px, 48px).
  function reveal(_node: HTMLElement, { duration = 420 }: { duration?: number } = {}) {
    return {
      duration,
      css: (t: number) => {
        // Ease the radius so the reveal starts fast and settles, and
        // the close hugs the button at the end.
        const eased = t * t * (3 - 2 * t); // smoothstep
        const r = 160 * eased;
        const opacity = 0.4 + 0.6 * t;
        return `clip-path: circle(${r}vmax at calc(100% - 48px) 48px); opacity: ${opacity};`;
      },
    };
  }
</script>

{#if workspace.isOpen}
  <div
    class="panel"
    role="dialog"
    aria-label="Workspace"
    in:reveal={{ duration: 420 }}
    out:reveal={{ duration: 340 }}
  >
    <div class="panel-body">
      <aside class="sidebar">
        <div class="side-head">
          <span class="side-head-label">Explorer</span>
          <span class="side-head-sub">live_demo / sandbox</span>
        </div>
        <div class="tree-scroll">
          {#if workspace.tree.length === 0 && !workspace.liveUp}
            <div class="empty">
              <div class="empty-title">Sandbox is empty</div>
              <div class="empty-sub">Files will appear here as the assistant creates them.</div>
            </div>
          {:else}
            <FileTree nodes={workspace.tree} />
          {/if}
        </div>
      </aside>
      <Preview />
    </div>
  </div>
{/if}

<style>
  .panel {
    /* Absolute within the stage-scaled overlay (OverlayLayer). Fills the
       full 1920x1080 stage area; sits under the HUD cluster (z-index:
       20) so the FAB/X button stays on top at all times. */
    position: absolute;
    inset: 0;
    background: #1e1e1e;
    z-index: 10;
    display: flex;
    flex-direction: column;
    font-family: 'Segoe UI', -apple-system, system-ui, sans-serif;
    color: #cccccc;
    pointer-events: auto;
    /* The initial clip-path matches the transition's t=1 so that, in
       the absence of an animation, the panel is fully visible. The
       reveal function overrides this during enter/exit. Origin is the
       FAB's centre in stage coordinates (1920 - 48, 48). */
    clip-path: circle(160vmax at calc(100% - 48px) 48px);
    will-change: clip-path, opacity;
  }

  .panel-body {
    flex: 1;
    display: flex;
    min-height: 0;
  }

  .sidebar {
    width: 260px;
    background: #252526;
    border-right: 1px solid #3c3c3c;
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex-shrink: 0;
  }
  .side-head {
    padding: 18px 14px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    border-bottom: 1px solid #2d2d2d;
  }
  .side-head-label {
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #bbbbbb;
    font-weight: 600;
  }
  .side-head-sub {
    font-size: 10.5px;
    color: #6f6f6f;
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    letter-spacing: 0.02em;
  }
  .tree-scroll {
    flex: 1;
    overflow: auto;
    padding: 4px 0 16px;
  }

  .empty {
    padding: 32px 20px;
    text-align: center;
    color: #6f6f6f;
  }
  .empty-title {
    font-size: 13px;
    color: #9e9e9e;
    margin-bottom: 6px;
    font-weight: 500;
  }
  .empty-sub {
    font-size: 12px;
    line-height: 1.5;
  }
</style>
