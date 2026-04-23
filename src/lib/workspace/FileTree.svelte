<script lang="ts">
  import type { TreeNode } from './workspace.svelte';
  import { workspace, isPreviewable } from './workspace.svelte';
  import { iconForFile, folderIcon, liveAppIcon } from './icons';
  import Self from './FileTree.svelte';

  type Props = { nodes: TreeNode[]; depth?: number };
  let { nodes, depth = 0 }: Props = $props();
</script>

<ul class="tree" class:root={depth === 0}>
  {#if depth === 0 && workspace.liveUp}
    <li>
      <button
        class="row live"
        class:active={workspace.isLiveAppOpen()}
        onclick={() => workspace.openLiveApp()}
        style:padding-left={`${8 + depth * 14}px`}
      >
        <span class="icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={liveAppIcon.path} fill={liveAppIcon.color} />
          </svg>
        </span>
        <span class="name">live app</span>
        <span class="live-dot" aria-label="running"></span>
      </button>
    </li>
  {/if}

  {#each nodes as node (node.path)}
    {#if node.type === 'dir'}
      {@const isOpen = workspace.expanded[node.path] !== false}
      {@const folderIc = folderIcon(isOpen)}
      {@const dirChanged = workspace.hasChange(node.path)}
      <li>
        <button
          class="row dir"
          onclick={() => workspace.toggleDir(node.path)}
          style:padding-left={`${8 + depth * 14}px`}
        >
          <span class="chevron" class:open={isOpen} aria-hidden="true">
            <svg viewBox="0 0 12 12"><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={folderIc.path} fill={folderIc.color} />
            </svg>
          </span>
          <span class="name">{node.name}</span>
          {#if dirChanged}
            <span class="change-dot change-dot-dir" aria-label="contains new or changed files"></span>
          {/if}
        </button>
        {#if isOpen}
          <Self nodes={node.children} depth={depth + 1} />
        {/if}
      </li>
    {:else}
      {@const fileIc = iconForFile(node.name)}
      {@const canOpen = isPreviewable(node.name)}
      {@const fileChanged = workspace.hasChange(node.path)}
      <li>
        <button
          class="row file"
          class:active={workspace.isFileOpen(node.path)}
          class:disabled={!canOpen}
          disabled={!canOpen}
          onclick={() => canOpen && workspace.openFile(node.path)}
          style:padding-left={`${8 + depth * 14 + 14}px`}
          title={canOpen ? node.name : `${node.name} (not previewable)`}
        >
          <span class="icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d={fileIc.path} fill={fileIc.color} />
            </svg>
          </span>
          <span class="name">{node.name}</span>
          {#if fileChanged}
            <span class="change-dot" aria-label="new or changed"></span>
          {/if}
        </button>
      </li>
    {/if}
  {/each}
</ul>

<style>
  .tree {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 13px;
    color: #cccccc;
    font-family: 'Segoe UI', -apple-system, system-ui, sans-serif;
  }
  .tree.root { padding: 4px 0; }

  li { margin: 0; padding: 0; }

  .row {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    background: transparent;
    border: none;
    color: inherit;
    padding: 3px 10px 3px 8px;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    line-height: 1.5;
    font-family: inherit;
    transition: background 100ms ease;
  }
  .row:hover:not(:disabled) {
    background: #2a2d2e;
  }
  .row.active {
    background: #094771;
    color: #ffffff;
  }
  .row.active:hover { background: #0a5085; }
  .row.disabled {
    color: #707070;
    cursor: default;
    opacity: 0.75;
  }

  .chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    height: 10px;
    transition: transform 120ms ease;
    color: #9e9e9e;
    flex-shrink: 0;
  }
  .chevron.open { transform: rotate(90deg); }
  .chevron svg { width: 10px; height: 10px; }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  .icon svg { width: 16px; height: 16px; display: block; }

  .name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row.live {
    color: #5eead4;
    font-weight: 500;
  }
  .row.live.active { background: #042f2e; color: #ccfbf1; }

  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
    margin-left: auto;
    animation: live-pulse 1.8s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes live-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  .change-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 6px rgba(239, 68, 68, 0.7);
    margin-left: 8px;
    margin-right: 2px;
    flex-shrink: 0;
  }
  .change-dot-dir {
    background: #f97316;
    box-shadow: 0 0 5px rgba(249, 115, 22, 0.55);
    opacity: 0.9;
  }
</style>
