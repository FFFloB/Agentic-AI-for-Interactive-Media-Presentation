<script lang="ts">
  // Phone-shaped iframe that hosts the live app on http://localhost:5180.
  // We don't need synthetic touch events: the MVP app listens for pointer
  // events, and browsers fire those for mouse too.

  import PreviewChrome from './PreviewChrome.svelte';

  let iframeEl: HTMLIFrameElement | null = $state(null);
  let loaded = $state(false);
  let reloadKey = $state(0);

  function reload() {
    reloadKey += 1;
    loaded = false;
  }

  function onLoad() {
    loaded = true;
  }
</script>

<div class="sim-stage">
  <PreviewChrome url="http://localhost:5180" live onReload={reload} />

  <div class="frame">
    <div class="bezel">
      <div class="notch" aria-hidden="true"></div>
      <div class="screen">
        {#key reloadKey}
          <iframe
            bind:this={iframeEl}
            src="http://localhost:5180/"
            title="Live app"
            onload={onLoad}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          ></iframe>
        {/key}
        {#if !loaded}
          <div class="loading">
            <div class="spinner"></div>
            <div class="loading-label">Connecting to localhost:5180</div>
          </div>
        {/if}
      </div>
      <div class="home-indicator" aria-hidden="true"></div>
    </div>
  </div>
</div>

<style>
  .sim-stage {
    height: 100%;
    width: 100%;
    background: #1e1e1e;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 10px 16px 16px;
    box-sizing: border-box;
    gap: 10px;
    position: relative;
  }

  .frame {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    width: 100%;
  }

  /* Phone bezel. The bezel fills the full available height and the
     width follows from the 390:844 aspect ratio. 390x844 = iPhone 14-ish. */
  .bezel {
    position: relative;
    aspect-ratio: 390 / 844;
    height: 100%;
    max-width: 100%;
    width: auto;
    background: #0a0a0a;
    border-radius: 48px;
    padding: 12px;
    box-shadow:
      0 0 0 1.5px rgba(255, 255, 255, 0.08),
      0 30px 80px rgba(0, 0, 0, 0.55),
      0 10px 30px rgba(0, 0, 0, 0.4);
    box-sizing: border-box;
  }

  .notch {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: 110px;
    height: 28px;
    background: #0a0a0a;
    border-radius: 999px;
    z-index: 3;
    pointer-events: none;
  }

  .home-indicator {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 130px;
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.28);
    z-index: 3;
    pointer-events: none;
  }

  .screen {
    width: 100%;
    height: 100%;
    background: #ffffff;
    border-radius: 36px;
    overflow: hidden;
    position: relative;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
    background: #ffffff;
  }

  .loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: #fafafa;
    color: #64748b;
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 13px;
  }
  .spinner {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2.5px solid #cbd5e1;
    border-top-color: #14b8a6;
    animation: spin 700ms linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-label {
    font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
  }
</style>
