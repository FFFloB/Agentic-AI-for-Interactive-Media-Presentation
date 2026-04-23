<script lang="ts">
  // Stage-scaled overlay that hosts every bit of presenter UI that
  // should scale with the 1920x1080 stage: status indicator, workspace
  // FAB, workspace panel. A single fit-scaled 1920x1080 box contains
  // all of them, so they share one coordinate system and stack using
  // normal z-index within that layer. Letterboxed on non-16:9
  // viewports; the background shows through those bars.
  //
  // Replaces the old HudCorner component - that only covered the
  // top-right cluster and kept the explorer in viewport space, which
  // caused the panel to cover the FAB and drift on small screens.

  import { STAGE_WIDTH, STAGE_HEIGHT } from '$lib/constants';
  import StatusIndicator from './StatusIndicator.svelte';
  import WorkspaceFab from '$lib/workspace/WorkspaceFab.svelte';
  import WorkspaceExplorer from '$lib/workspace/WorkspaceExplorer.svelte';

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

<div class="overlay-viewport">
  <div
    class="overlay-stage"
    style:width="{STAGE_WIDTH}px"
    style:height="{STAGE_HEIGHT}px"
    style:zoom={fitScale}
  >
    <!-- Panel sits underneath the HUD cluster within this stacking context. -->
    <WorkspaceExplorer />

    <!-- HUD cluster: top-right within the stage. On top of the panel. -->
    <div class="hud-cluster">
      <StatusIndicator />
      <WorkspaceFab />
    </div>
  </div>
</div>

<style>
  .overlay-viewport {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 1000;
  }
  .overlay-stage {
    position: relative;
    pointer-events: none; /* children opt back in */
  }
  .hud-cluster {
    position: absolute;
    top: 24px;
    right: 24px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    z-index: 20; /* above the workspace panel (z-index: 10) */
    pointer-events: none;
  }
</style>
