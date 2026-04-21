<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { llmStage } from './stage.svelte';

  let { segmentId = 'llm-prediction' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, llmStage));
  onDestroy(() => unregisterStage(segmentId));

  // === Takeaways rail - same approach as the agentic-chat segment.
  //   Column shifts left once the first takeaway is due.

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    { at: 2, text: 'LLMs generate text one word at a time. Each word is picked from a ranked distribution over the whole vocabulary.' },
    { at: 5, text: 'Every next word is a fresh prediction. The input is everything written so far.' },
    { at: 9, text: 'In a dialog the AI also reads its own prior replies - they are part of the context for the next prediction.' },
  ];

  const takeawaysActive = $derived(llmStage.reveal(takeaways[0].at));

  // Auto-scroll: newest staged element anchors near the bottom of view.
  let rootEl: HTMLDivElement;

  function offsetWithin(el: HTMLElement, stopAt: HTMLElement): { x: number; y: number } {
    let x = 0;
    let y = 0;
    let cur: HTMLElement | null = el;
    while (cur && cur !== stopAt) {
      x += cur.offsetLeft;
      y += cur.offsetTop;
      cur = cur.offsetParent as HTMLElement | null;
    }
    return { x, y };
  }

  $effect(() => {
    const _ = llmStage.stageIndex;
    tick().then(() => autoScrollToLatest());
  });

  function autoScrollToLatest() {
    if (!rootEl) return;
    const seg = segments.get(segmentId);
    if (!seg) return;

    const staged = rootEl.querySelectorAll<HTMLElement>('[data-staged="true"]');
    const last = staged[staged.length - 1];
    if (!last) return;

    const { y: lastTopY } = offsetWithin(last, rootEl);
    const elemBottomWorldY = lastTopY + last.offsetHeight;
    const viewportWorldHeight = camera.viewportHeight / camera.zoom;

    const anchor = 0.85;
    const desiredCameraY = elemBottomWorldY - viewportWorldHeight * (anchor - 0.5);

    const minY = viewportWorldHeight / 2;
    const maxY = Math.max(minY, seg.height - viewportWorldHeight / 2);
    const y = Math.max(minY, Math.min(maxY, desiredCameraY));

    if (Math.abs(y - camera.y) < 2) return;

    camera.scrollTo(y, {
      duration: DEFAULTS.scroll.stageScrollDuration,
      ease: DEFAULTS.scroll.stageScrollEase,
    });
  }

  // Prediction candidates for stage 2. Ordered by probability. The
  // highest-ranked is the one that gets chosen.
  const candidates = [
    { token: 'mat', pct: 47 },
    { token: 'floor', pct: 14 },
    { token: 'couch', pct: 9 },
    { token: 'bed', pct: 6 },
    { token: 'chair', pct: 4 },
  ];

  // Short list of conversation turns used by the "context view" card.
  const dialog = [
    { who: 'user', text: 'Should I use blue or red for warning signs?' },
    { who: 'ai', text: 'Red is stronger for warnings - it reads as danger at a glance.' },
    { who: 'user', text: 'What about for softer, cautionary ones?' },
  ];
</script>

<div class="llm-root" class:two-col={takeawaysActive} bind:this={rootEl} data-segment-root>
  <!-- Takeaways rail, same pattern and positioning as the chat segment. -->
  <aside
    class="right-rail"
    class:visible={takeawaysActive}
    style:transform="translateY({railTopY}px)"
  >
    <div class="rr-label" class:visible={takeawaysActive}>Takeaways</div>
    <ol class="takeaways">
      {#each takeaways as item, i (item.at)}
        <li class="takeaway" class:shown={llmStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Under the hood</span>
    <h1 class="headline-gradient">What is an LLM?</h1>
    <p class="subhead">
      At their core, language models predict the next word. Everything
      else, the reasoning, the tool use, the long conversations, rides
      on top of that one mechanism.
    </p>
  </header>

  <div class="chat-column">
    <!-- Part 1 - token-level prediction -->

    {#if llmStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          Finish this sentence: <em>"The cat sat on the…"</em>
        </div>
      </div>
    {/if}

    {#if llmStage.reveal(2)}
      <div class="predict-card" data-staged="true">
        <div class="pc-header">
          <span class="pc-icon">llm</span>
          <span class="pc-name">next-word prediction</span>
          <span class="pc-status">sampling</span>
        </div>
        <div class="pc-input">
          <span class="pc-label">given</span>
          <span class="pc-tokens">
            <span class="pc-tok">The</span>
            <span class="pc-tok">cat</span>
            <span class="pc-tok">sat</span>
            <span class="pc-tok">on</span>
            <span class="pc-tok">the</span>
            <span class="pc-cursor">▋</span>
          </span>
        </div>
        <ul class="pc-candidates">
          {#each candidates as c, i (c.token)}
            <li class="pc-row" class:chosen={i === 0 && llmStage.reveal(3)}>
              <span class="pc-rank">{String(i + 1).padStart(2, '0')}</span>
              <span class="pc-token">{c.token}</span>
              <span class="pc-bar"><span class="pc-bar-fill" style:width="{c.pct}%"></span></span>
              <span class="pc-pct">{c.pct}%</span>
            </li>
          {/each}
        </ul>
        {#if llmStage.reveal(3)}
          <div class="pc-chosen-line">
            Chosen: <strong>mat</strong> <span class="pc-note">(highest probability wins)</span>
          </div>
        {/if}
      </div>
    {/if}

    {#if llmStage.reveal(3)}
      <div class="message ai" data-staged="true">
        <div class="avatar">AI</div>
        <div class="body">
          <span class="stream-line">The cat sat on the <span class="stream-new">mat</span>.</span>
        </div>
      </div>
    {/if}

    {#if llmStage.reveal(4)}
      <!-- Extend the sentence. Every newly-appended word was itself a
           fresh prediction over the whole preceding string. -->
      <div class="stream-card" data-staged="true">
        <div class="sc-label">What actually happened</div>
        <div class="sc-body">
          Every word above came out of the same loop. The model fed its own
          output back in as input and predicted the next one, over and over:
        </div>
        <div class="sc-trace">
          <div class="sc-step"><span class="sc-ctx">The cat sat on the</span> → <span class="sc-tok">mat</span></div>
          <div class="sc-step"><span class="sc-ctx">The cat sat on the mat</span> → <span class="sc-tok">.</span></div>
          <div class="sc-step"><span class="sc-ctx">The cat sat on the mat.</span> → <span class="sc-tok">&lt;end&gt;</span></div>
        </div>
      </div>
    {/if}

    <!-- Part 2 - dialog, same mechanism, bigger input -->

    {#if llmStage.reveal(5)}
      <div class="section-break" data-staged="true">
        <span class="sb-line"></span>
        <span class="sb-text">Same thing, in a conversation</span>
        <span class="sb-line"></span>
      </div>
    {/if}

    {#if llmStage.reveal(6)}
      <div class="message user" data-staged="true">
        <div class="bubble">{dialog[0].text}</div>
      </div>
    {/if}

    {#if llmStage.reveal(7)}
      <div class="message ai" data-staged="true">
        <div class="avatar">AI</div>
        <div class="body">{dialog[1].text}</div>
      </div>
    {/if}

    {#if llmStage.reveal(8)}
      <div class="message user" data-staged="true">
        <div class="bubble">{dialog[2].text}</div>
      </div>
    {/if}

    {#if llmStage.reveal(9)}
      <!-- Context view: show the assembled input the model will use to
           predict its next reply. The AI's own prior reply is highlighted
           so it's obvious it counts as input. -->
      <div class="context-view" data-staged="true">
        <div class="cv-header">
          <span class="cv-icon">⇦</span>
          <span class="cv-name">what the model reads to predict its next reply</span>
        </div>
        <ol class="cv-list">
          {#each dialog as turn, i (i)}
            <li class="cv-turn" class:self={turn.who === 'ai'}>
              <span class="cv-who">{turn.who === 'user' ? 'user' : 'ai'}</span>
              <span class="cv-text">{turn.text}</span>
              {#if turn.who === 'ai'}
                <span class="cv-flag">its own words</span>
              {/if}
            </li>
          {/each}
          <li class="cv-predict">
            <span class="cv-who future">ai</span>
            <span class="cv-pending">predict the next tokens…</span>
          </li>
        </ol>
      </div>
    {/if}

    {#if llmStage.reveal(10)}
      <div class="message ai" data-staged="true">
        <div class="avatar">AI</div>
        <div class="body">
          For cautionary signals, <strong>amber or yellow</strong> works
          well. It draws attention without triggering the alarm response
          that red does - which matches the softer tone you described.
        </div>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  /* === Layout + header mirror the agentic-chat segment so the two read
         as one visual family. ============================================= */

  .llm-root {
    width: 100%;
    height: 100%;
    padding: 120px 0 180px 0;
    position: relative;
  }

  .segment-header {
    width: min(820px, 100%);
    margin: 0 auto 64px;
    padding: 0 24px;
  }

  .eyebrow {
    display: inline-block;
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    margin-bottom: 18px;
  }

  h1 {
    font-family: var(--font-sans);
    font-size: 108px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.12;
    padding-bottom: 0.08em;
    margin: 0;
  }

  .subhead {
    margin-top: 28px;
    font-size: 29px;
    line-height: 1.55;
    color: var(--color-text-muted);
    max-width: 36em;
  }

  .chat-column {
    width: min(820px, 100%);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 26px;
  }

  /* === Messages - lifted 1:1 from AgenticChatSegment. ================= */

  .message {
    display: flex;
    gap: 18px;
    animation: fade-in 0.35s ease-out;
  }

  .message.user {
    justify-content: flex-end;
  }

  .bubble {
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text);
    border: 1px solid rgba(255, 255, 255, 0.09);
    padding: 20px 26px;
    border-radius: 24px 24px 8px 24px;
    max-width: 78%;
    font-size: 26px;
    line-height: 1.5;
  }

  .bubble em {
    font-style: italic;
    color: var(--color-text);
  }

  .message.ai {
    align-items: flex-start;
  }

  .avatar {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--gradient-accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.04em;
    margin-top: 3px;
  }

  .body {
    flex: 1;
    font-size: 26px;
    line-height: 1.55;
    color: var(--color-text);
    padding-top: 6px;
  }

  .stream-new {
    background: rgba(236, 72, 153, 0.18);
    border-radius: 6px;
    padding: 1px 8px;
    color: var(--color-text);
    animation: token-in 0.45s ease-out;
  }

  /* === Prediction card - same visual family as chat's tool-call card
         (rounded, bordered, AI-accent header) but structured for a
         ranked list of candidate tokens with proportional bars. ========= */

  .predict-card {
    margin-left: 66px;
    border: 1px solid var(--color-tool-border);
    background: var(--color-tool-bg);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .pc-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 22px;
    border-bottom: 1px solid var(--color-border);
    font-family: var(--font-mono);
    font-size: 18px;
    letter-spacing: 0.04em;
  }

  .pc-icon {
    font-size: 15px;
    font-weight: 600;
    padding: 5px 11px;
    border-radius: 6px;
    background: var(--gradient-accent);
    color: white;
    letter-spacing: 0.04em;
  }

  .pc-name {
    color: var(--color-text);
    font-weight: 500;
  }

  .pc-status {
    margin-left: auto;
    color: var(--color-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 15px;
  }

  .pc-input {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 18px 22px 8px;
    font-size: 22px;
  }

  .pc-label {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .pc-tokens {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }

  .pc-tok {
    font-family: var(--font-mono);
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text);
    font-size: 20px;
  }

  .pc-cursor {
    color: var(--color-ai-mid);
    font-size: 24px;
    animation: cursor-blink 1.2s step-end infinite;
  }

  .pc-candidates {
    list-style: none;
    padding: 12px 22px 22px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .pc-row {
    display: grid;
    grid-template-columns: 52px 130px 1fr 80px;
    align-items: center;
    gap: 18px;
    padding: 10px 14px;
    border: 1px solid var(--color-border);
    background: rgba(0, 0, 0, 0.22);
    border-radius: 8px;
    transition: all 0.35s ease;
  }

  .pc-row.chosen {
    border-color: rgba(236, 72, 153, 0.55);
    background: rgba(168, 85, 247, 0.14);
    box-shadow: 0 0 28px 0 rgba(236, 72, 153, 0.18);
  }

  .pc-rank {
    font-family: var(--font-mono);
    font-size: 16px;
    color: var(--color-text-subtle);
    letter-spacing: 0.1em;
  }

  .pc-token {
    font-family: var(--font-mono);
    font-size: 22px;
    color: var(--color-text);
  }

  .pc-bar {
    height: 10px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 5px;
    overflow: hidden;
  }

  .pc-bar-fill {
    display: block;
    height: 100%;
    background: var(--gradient-accent);
    border-radius: 5px;
    transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .pc-pct {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--color-text-muted);
    text-align: right;
  }

  .pc-chosen-line {
    padding: 14px 22px 22px;
    border-top: 1px solid var(--color-border);
    font-size: 20px;
    color: var(--color-text-muted);
  }

  .pc-chosen-line strong {
    color: var(--color-ai-mid);
    font-weight: 600;
  }

  .pc-note {
    font-size: 17px;
    color: var(--color-text-subtle);
    margin-left: 8px;
  }

  /* === Stream card - shows the "feed your own output back in" loop
         behind the scenes. ========================================= */

  .stream-card {
    margin-left: 66px;
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-md);
    padding: 22px 26px;
  }

  .sc-label {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    margin-bottom: 12px;
  }

  .sc-body {
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text-muted);
    margin-bottom: 16px;
  }

  .sc-trace {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sc-step {
    font-family: var(--font-mono);
    font-size: 19px;
    color: var(--color-text);
    padding: 10px 14px;
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid var(--color-code-border);
    border-radius: 8px;
  }

  .sc-ctx {
    color: var(--color-text-muted);
  }

  .sc-tok {
    color: var(--color-ai-mid);
    font-weight: 500;
    background: rgba(236, 72, 153, 0.12);
    padding: 2px 8px;
    border-radius: 4px;
  }

  /* === Section break between the token demo and the dialog demo. ===== */

  .section-break {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 32px 0 12px;
    color: var(--color-text-subtle);
  }

  .sb-line {
    flex: 1;
    height: 1px;
    background: var(--color-border);
  }

  .sb-text {
    font-family: var(--font-mono);
    font-size: 17px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  /* === Context view - the one-card summary of what the model reads
         before generating its next reply. The AI's own prior reply is
         marked with a flag so the takeaway is unmissable. ============ */

  .context-view {
    margin-left: 66px;
    border: 1px solid var(--color-tool-border);
    background: var(--color-tool-bg);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .cv-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 22px;
    border-bottom: 1px solid var(--color-border);
  }

  .cv-icon {
    font-family: var(--font-mono);
    font-size: 18px;
    padding: 4px 10px;
    border-radius: 6px;
    background: var(--gradient-accent);
    color: white;
  }

  .cv-name {
    font-family: var(--font-mono);
    font-size: 17px;
    color: var(--color-text);
    letter-spacing: 0.04em;
  }

  .cv-list {
    list-style: none;
    padding: 18px 22px 22px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .cv-turn,
  .cv-predict {
    display: grid;
    grid-template-columns: 72px 1fr auto;
    align-items: baseline;
    gap: 16px;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }

  .cv-turn.self {
    border-color: rgba(236, 72, 153, 0.55);
    background: rgba(168, 85, 247, 0.16);
    box-shadow: 0 0 28px 0 rgba(236, 72, 153, 0.18);
  }

  .cv-who {
    font-family: var(--font-mono);
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--color-text-subtle);
  }

  .cv-turn.self .cv-who {
    color: var(--color-ai-mid);
  }

  .cv-who.future {
    color: var(--color-ai-mid);
    border: 1px dashed rgba(236, 72, 153, 0.45);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .cv-text {
    font-size: 21px;
    line-height: 1.45;
    color: var(--color-text);
  }

  .cv-flag {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
    background: rgba(236, 72, 153, 0.14);
    padding: 4px 10px;
    border-radius: 9999px;
    white-space: nowrap;
  }

  .cv-predict {
    border-style: dashed;
    background: rgba(0, 0, 0, 0.18);
  }

  .cv-pending {
    font-family: var(--font-mono);
    font-size: 19px;
    color: var(--color-text-muted);
    font-style: italic;
  }

  /* === Takeaways rail + column shift - identical structure to chat. === */

  .tail-spacer {
    height: 240px;
  }

  .llm-root .segment-header,
  .llm-root .chat-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .llm-root.two-col .segment-header,
  .llm-root.two-col .chat-column {
    transform: translateX(-300px);
  }

  .right-rail {
    position: absolute;
    top: 0;
    left: 1400px;
    width: 520px;
    pointer-events: none;
    opacity: 0;
    transition:
      opacity 0.55s ease,
      left 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .right-rail.visible {
    opacity: 1;
    left: 1150px;
  }

  .rr-label {
    font-family: var(--font-mono);
    font-size: 22px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    margin-bottom: 26px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border);
    opacity: 0;
    transition: opacity 0.55s ease;
  }

  .rr-label.visible {
    opacity: 1;
  }

  .takeaways {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 26px;
    padding: 0;
    margin: 0;
  }

  .takeaway {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 20px;
    align-items: baseline;
    opacity: 0;
    transform: translateX(10px);
    transition:
      opacity 0.5s ease,
      transform 0.5s ease;
    will-change: opacity, transform;
  }

  .takeaway.shown {
    opacity: 1;
    transform: translateX(0);
  }

  .t-index {
    font-family: var(--font-mono);
    font-size: 22px;
    color: var(--color-text-subtle);
    letter-spacing: 0.1em;
  }

  .t-text {
    font-size: 30px;
    line-height: 1.4;
    color: var(--color-text);
    font-weight: 400;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes token-in {
    from {
      opacity: 0;
      background: rgba(236, 72, 153, 0.4);
    }
    to {
      opacity: 1;
      background: rgba(236, 72, 153, 0.18);
    }
  }

  @keyframes cursor-blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0.15;
    }
  }
</style>
