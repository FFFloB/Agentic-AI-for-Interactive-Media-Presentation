<script lang="ts">
  import { marked } from 'marked';
  import PreviewChrome from './PreviewChrome.svelte';

  type Props = { filePath: string };
  let { filePath }: Props = $props();

  let rendered = $state<string | null>(null);
  let error = $state<string | null>(null);
  let reloadTick = $state(0);

  marked.setOptions({
    gfm: true,
    breaks: false,
  });

  $effect(() => {
    const path = filePath;
    reloadTick;
    rendered = null;
    error = null;
    fetch(`/_sandbox/file?path=${encodeURIComponent(path)}`, { cache: 'no-store' })
      .then((r) => r.text())
      .then(async (text) => {
        rendered = await marked.parse(text);
      })
      .catch((e) => { error = String(e); });
  });

  function reload() {
    reloadTick += 1;
  }
</script>

<div class="md-preview">
  <PreviewChrome url={`sandbox / ${filePath}`} onReload={reload} />
  <div class="frame">
    <div class="scroller">
      {#if error}
        <div class="error">Couldn't load file.</div>
      {:else if rendered === null}
        <div class="loading">Loading...</div>
      {:else}
        <article class="md">
          {@html rendered}
        </article>
      {/if}
    </div>
  </div>
</div>

<style>
  .md-preview {
    height: 100%;
    width: 100%;
    padding: 10px 16px 16px;
    background: #1e1e1e;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
  }
  .frame {
    width: 100%;
    height: 100%;
    max-width: 860px;
    flex: 1;
    min-height: 0;
    border-radius: 14px;
    background: #ffffff;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06);
    overflow: hidden;
    display: flex;
  }
  .scroller {
    flex: 1;
    overflow: auto;
    padding: 48px 56px;
    color: #24292f;
    font-family: 'Segoe UI', -apple-system, system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.65;
  }
  .loading, .error {
    color: #858585;
    font-size: 14px;
  }
  .error { color: #d73a49; }

  .md :global(h1),
  .md :global(h2),
  .md :global(h3),
  .md :global(h4) {
    font-weight: 700;
    letter-spacing: -0.01em;
    margin-top: 1.6em;
    margin-bottom: 0.4em;
    line-height: 1.25;
    color: #1f2328;
  }
  .md :global(h1) {
    font-size: 28px;
    border-bottom: 1px solid #e1e4e8;
    padding-bottom: 0.3em;
    margin-top: 0;
  }
  .md :global(h2) {
    font-size: 22px;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.25em;
  }
  .md :global(h3) { font-size: 18px; }
  .md :global(h4) { font-size: 16px; }

  .md :global(p) { margin: 0 0 1em; }
  .md :global(ul),
  .md :global(ol) { margin: 0 0 1em; padding-left: 1.6em; }
  .md :global(li) { margin-bottom: 0.25em; }
  .md :global(li input[type="checkbox"]) {
    margin-right: 6px;
    accent-color: #14b8a6;
  }
  .md :global(li.task-list-item) { list-style: none; margin-left: -1.4em; }

  .md :global(code) {
    font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
    background: #f6f8fa;
    padding: 1px 6px;
    border-radius: 6px;
    font-size: 0.88em;
    color: #24292f;
  }
  .md :global(pre) {
    background: #f6f8fa;
    border-radius: 8px;
    padding: 14px 16px;
    overflow-x: auto;
    margin: 0 0 1em;
  }
  .md :global(pre code) {
    background: none;
    padding: 0;
    font-size: 13px;
    line-height: 1.55;
  }
  .md :global(blockquote) {
    border-left: 4px solid #d0d7de;
    padding: 0 1em;
    color: #57606a;
    margin: 0 0 1em;
  }
  .md :global(a) { color: #0969da; text-decoration: none; }
  .md :global(a:hover) { text-decoration: underline; }
  .md :global(hr) {
    border: none;
    border-top: 1px solid #e1e4e8;
    margin: 2em 0;
  }
  .md :global(table) {
    border-collapse: collapse;
    margin: 0 0 1em;
    font-size: 14px;
  }
  .md :global(th),
  .md :global(td) {
    border: 1px solid #d0d7de;
    padding: 6px 12px;
    text-align: left;
  }
  .md :global(th) { background: #f6f8fa; font-weight: 600; }
  .md :global(strong) { color: #1f2328; font-weight: 700; }
  .md :global(img) { max-width: 100%; border-radius: 6px; }
</style>
