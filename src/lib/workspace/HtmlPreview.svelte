<script lang="ts">
  import { workspace } from './workspace.svelte';
  import PreviewChrome from './PreviewChrome.svelte';

  type Props = { filePath: string };
  let { filePath }: Props = $props();

  let html = $state<string | null>(null);
  let error = $state<string | null>(null);
  let iframeEl: HTMLIFrameElement | null = $state(null);
  let blobUrl: string | null = null;
  let reloadTick = $state(0);

  $effect(() => {
    const path = filePath;
    reloadTick;
    html = null;
    error = null;
    // Force a fresh fetch when the reload button is hit.
    // (fileCache is keyed by path; clear it so loadFile re-fetches.)
    (workspace as unknown as { loadFile: (p: string) => Promise<string> });
    // openFile already clears the cache entry; for reload, do it here.
    // We use a small hack: refetch by going through the endpoint directly.
    fetch(`/_sandbox/file?path=${encodeURIComponent(path)}`, { cache: 'no-store' })
      .then((r) => r.text())
      .then((text) => { html = text; })
      .catch((e) => { error = String(e); });
  });

  $effect(() => {
    if (html === null || !iframeEl) return;
    const blob = new Blob([html], { type: 'text/html' });
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    blobUrl = URL.createObjectURL(blob);
    iframeEl.src = blobUrl;
  });

  $effect(() => () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  });

  function reload() {
    reloadTick += 1;
  }
</script>

<div class="html-preview">
  <PreviewChrome url={`sandbox / ${filePath}`} onReload={reload} />
  <div class="frame">
    {#if error}
      <div class="error">Couldn't load file.</div>
    {:else if html === null}
      <div class="loading">Loading...</div>
    {:else}
      <iframe
        bind:this={iframeEl}
        title={filePath}
        sandbox="allow-scripts allow-same-origin allow-forms"
      ></iframe>
    {/if}
  </div>
</div>

<style>
  .html-preview {
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
    max-width: 1280px;
    flex: 1;
    min-height: 0;
    border-radius: 14px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06);
    position: relative;
  }
  iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
  .loading, .error {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #858585;
    font-family: 'Segoe UI', -apple-system, system-ui, sans-serif;
    font-size: 14px;
  }
  .error { color: #f48771; }
</style>
