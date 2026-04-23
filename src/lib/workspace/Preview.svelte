<script lang="ts">
  import { workspace, fileKind } from './workspace.svelte';
  import HtmlPreview from './HtmlPreview.svelte';
  import MarkdownPreview from './MarkdownPreview.svelte';
  import PhoneSimulator from './PhoneSimulator.svelte';

  const target = $derived(workspace.target);
</script>

<div class="preview">
  {#if target.kind === 'none'}
    <div class="placeholder">
      <div class="big-glyph" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="48" height="48">
          <path d="M6 2h9l5 5v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5L14 3.5z" fill="#3a3d41"/>
        </svg>
      </div>
      <div class="placeholder-title">Nothing open yet</div>
      <div class="placeholder-sub">
        Select a file on the left to preview it.
        <br />
        HTML and Markdown open in the viewer; other files are visible but not previewable.
      </div>
    </div>
  {:else if target.kind === 'live-app'}
    <PhoneSimulator />
  {:else if target.kind === 'file'}
    {@const kind = fileKind(target.path.split('/').pop() || '')}
    {#if kind === 'html'}
      <HtmlPreview filePath={target.path} />
    {:else if kind === 'markdown'}
      <MarkdownPreview filePath={target.path} />
    {:else}
      <div class="placeholder">
        <div class="placeholder-title">Not previewable</div>
        <div class="placeholder-sub">
          {target.path.split('/').pop()} is visible in the tree for context, but only HTML and Markdown files can be opened in the viewer.
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .preview {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    background: #1e1e1e;
    position: relative;
  }
  .placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #858585;
    font-family: 'Segoe UI', -apple-system, system-ui, sans-serif;
    padding: 48px;
    text-align: center;
  }
  .big-glyph { opacity: 0.7; }
  .placeholder-title {
    font-size: 16px;
    color: #bbbbbb;
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  .placeholder-sub {
    font-size: 13px;
    max-width: 400px;
    line-height: 1.55;
  }
</style>
