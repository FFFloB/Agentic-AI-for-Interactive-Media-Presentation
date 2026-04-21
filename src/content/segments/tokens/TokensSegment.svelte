<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { tokensStage, TOK } from './stage.svelte';
  import { mode } from '$content/mode.svelte';

  let { segmentId = 'tokens' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, tokensStage));
  onDestroy(() => unregisterStage(segmentId));

  // === Takeaways rail - same pattern as the other scrolling segments. ====

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    {
      at: TOK.EXPLAIN,
      text: 'A token is the unit the model reads and writes. Roughly three-quarters of a word.',
    },
    {
      at: TOK.TIER_3,
      text: 'Context windows used to hold a chapter. Now they hold entire books, or full codebases.',
    },
    {
      at: TOK.CLOSER,
      text: 'At this scale, running out of room is rare. What matters is what you put there.',
    },
  ];

  const takeawaysActive = $derived(tokensStage.reveal(takeaways[0].at));

  // === Auto-scroll to newest staged element ============================

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
    const _ = tokensStage.stageIndex;
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

  // === Tokenisation demo data ===========================================
  //
  // Each example is pre-split into pseudo-tokens that illustrate how a
  // real tokenizer would chunk the string. Exact splits vary between
  // tokenizers; these are representative of typical BPE behaviour:
  // common words stay whole, rare/long words get sliced up, punctuation
  // and leading spaces are their own tokens.

  const tokenExamples: { source: string; tokens: string[] }[] = [
    {
      source: '"Hello, world!"',
      tokens: ['"', 'Hello', ',', ' world', '!', '"'],
    },
    {
      source: 'programming is fun',
      tokens: ['programming', ' is', ' fun'],
    },
    {
      source: 'antidisestablishmentarianism',
      tokens: ['anti', 'dis', 'establish', 'ment', 'arian', 'ism'],
    },
  ];

  // === Scale bars =======================================================

  const MAX_TOKENS = 1_000_000;

  // Tiers are derived so the frontier comparison copy flips with mode.
  // Everything else is audience-neutral (novels, essays, etc.).
  const tiers = $derived([
    {
      stage: TOK.TIER_1,
      label: '4K',
      tokens: 4_000,
      comp: 'A long email, or a few pages of prose.',
    },
    {
      stage: TOK.TIER_2,
      label: '32K',
      tokens: 32_000,
      comp: 'A novella, or a short technical paper.',
    },
    {
      stage: TOK.TIER_3,
      label: '128K',
      tokens: 128_000,
      comp: 'A full novel (~300 pages).',
    },
    {
      stage: TOK.TIER_4,
      label: '200K',
      tokens: 200_000,
      comp: 'A long novel plus supporting notes.',
    },
    {
      stage: TOK.TIER_5,
      label: '1M+',
      tokens: 1_000_000,
      comp:
        mode.current === 'design'
          ? 'An entire book series, or a complete design system and brand kit.'
          : 'An entire book series, or a full mid-size codebase.',
      frontier: true,
    },
  ]);

  // The chart card first appears with the transition stage, then fills in
  // as further stages land.
  const chartCardVisible = $derived(tokensStage.reveal(TOK.TRANSITION));
</script>

<div
  class="tok-root"
  class:two-col={takeawaysActive}
  bind:this={rootEl}
  data-segment-root
>
  <!-- Takeaways rail -->
  <aside
    class="right-rail"
    class:visible={takeawaysActive}
    style:transform="translateY({railTopY}px)"
  >
    <div class="rr-label" class:visible={takeawaysActive}>Takeaways</div>
    <ol class="takeaways">
      {#each takeaways as item, i (item.at)}
        <li class="takeaway" class:shown={tokensStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Scale</span>
    <h1 class="headline-gradient">Tokens, and how much fits</h1>
    <p class="subhead">
      You keep hearing the word "token". Here is what one actually is,
      and how many modern models can hold at once.
    </p>
  </header>

  <div class="tok-column">
    <!-- Stage 1 - framing question ------------------------------------ -->
    {#if tokensStage.reveal(TOK.ASK)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          Everyone keeps saying "tokens". What is a token, and why does
          the count matter?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - the explainer --------------------------------------- -->
    {#if tokensStage.reveal(TOK.EXPLAIN)}
      <div class="explainer" data-staged="true">
        <div class="ex-label">The unit</div>
        <p class="ex-body">
          A <strong>token</strong> is the smallest piece of text a language
          model reads or writes. Not quite a word, not quite a letter -
          somewhere in between.
        </p>
        <div class="ex-rules">
          <div class="ex-rule">
            <span class="er-num">≈¾</span>
            <span class="er-text">1 token is roughly three-quarters of a word.</span>
          </div>
          <div class="ex-rule">
            <span class="er-num">×1.3</span>
            <span class="er-text">An English word averages about 1.3 tokens.</span>
          </div>
          <div class="ex-rule">
            <span class="er-num">~500</span>
            <span class="er-text">A page of prose is around 500 tokens.</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 3 - tokenisation demo ------------------------------------ -->
    {#if tokensStage.reveal(TOK.TOKENIZE_DEMO)}
      <div class="tokenize-card" data-staged="true">
        <div class="tc-header">
          <span class="tc-icon">tk</span>
          <span class="tc-name">tokenizer</span>
          <span class="tc-status">how text becomes tokens</span>
        </div>
        <div class="tc-body">
          {#each tokenExamples as example, i (i)}
            <div class="tc-row">
              <div class="tc-source">{example.source}</div>
              <div class="tc-arrow">→</div>
              <div class="tc-tokens">
                {#each example.tokens as tok, j (j)}
                  <span class="tc-tok" data-kind={j % 2}>{tok.replace(/ /g, '␣')}</span>
                {/each}
                <span class="tc-count">{example.tokens.length} tokens</span>
              </div>
            </div>
          {/each}
        </div>
        <div class="tc-foot">
          Common words stay whole. Rare or long words get sliced into
          sub-pieces. Punctuation and leading spaces count as their own
          tokens.
        </div>
      </div>
    {/if}

    <!-- Stage 4 - transition to the scale chart ------------------------ -->
    {#if tokensStage.reveal(TOK.TRANSITION)}
      <div class="callout accent" data-staged="true">
        <div class="co-label">So how much can a model hold?</div>
        <p class="co-body">
          This is the whole conversation, every file, the system prompt,
          the memory, the tools - all of it measured in tokens. Here is
          how the ceiling has moved.
        </p>
      </div>
    {/if}

    <!-- Chart card (reveals with transition; bars fill in over stages 5-9) -->
    {#if chartCardVisible}
      <div class="chart-card" data-staged="true">
        <div class="cc-legend">
          <span class="leg-tokens">Tokens</span>
          <span class="leg-equiv">Roughly equivalent to</span>
        </div>

        {#each tiers as tier (tier.label)}
          <div
            class="tier"
            class:shown={tokensStage.reveal(tier.stage)}
            class:frontier={tier.frontier}
          >
            <span class="tier-label">{tier.label}</span>
            <div class="tier-bar-track">
              <div
                class="tier-bar"
                style:width="{(tier.tokens / MAX_TOKENS) * 100}%"
              ></div>
            </div>
            <span class="tier-equiv">{tier.comp}</span>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Stage 10 - closing beat ---------------------------------------- -->
    {#if tokensStage.reveal(TOK.CLOSER)}
      <div class="closer" data-staged="true">
        <div class="cl-label">What this changes</div>
        <p class="cl-body">
          When the window was small, the craft was cutting: what can I
          afford to include? At millions of tokens, the craft flips. It
          is no longer what to leave out. It is what to bring in, and how
          to keep it truthful.
        </p>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  /* === Root + header - match the other scrolling segments. ============ */

  .tok-root {
    width: 100%;
    height: 100%;
    padding: 120px 0 180px 0;
    position: relative;
  }

  .segment-header {
    width: min(880px, 100%);
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

  .tok-column {
    width: min(880px, 100%);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  /* === Messages - same as the other chat segments ==================== */

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
    padding: 18px 26px;
    border-radius: 24px 24px 8px 24px;
    max-width: 78%;
    font-size: 26px;
    line-height: 1.5;
  }

  /* === Explainer card (stage 2) ======================================= */

  .explainer {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    animation: fade-in 0.45s ease-out;
  }

  .ex-label {
    font-family: var(--font-mono);
    font-size: 16px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
    margin-bottom: 14px;
  }

  .ex-body {
    margin: 0 0 22px 0;
    font-size: 26px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .ex-body strong {
    color: var(--color-ai-mid);
    font-weight: 600;
  }

  .ex-rules {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .ex-rule {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 22px;
    align-items: baseline;
    padding: 12px 18px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .er-num {
    font-family: var(--font-mono);
    font-size: 24px;
    font-weight: 600;
    color: var(--color-ai-mid);
    letter-spacing: 0.02em;
  }

  .er-text {
    font-size: 21px;
    line-height: 1.4;
    color: var(--color-text-muted);
  }

  /* === Tokenisation card (stage 3) ==================================== */

  .tokenize-card {
    border: 1px solid var(--color-tool-border);
    background: var(--color-tool-bg);
    border-radius: var(--radius-md);
    overflow: hidden;
    animation: fade-in 0.45s ease-out;
  }

  .tc-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 22px;
    border-bottom: 1px solid var(--color-border);
    font-family: var(--font-mono);
    font-size: 18px;
    letter-spacing: 0.04em;
  }

  .tc-icon {
    font-size: 15px;
    font-weight: 600;
    padding: 5px 11px;
    border-radius: 6px;
    background: var(--gradient-accent);
    color: white;
    letter-spacing: 0.04em;
  }

  .tc-name {
    color: var(--color-text);
    font-weight: 500;
  }

  .tc-status {
    margin-left: auto;
    color: var(--color-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 15px;
  }

  .tc-body {
    padding: 22px 26px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .tc-row {
    display: grid;
    grid-template-columns: 280px 40px 1fr;
    gap: 16px;
    align-items: center;
  }

  .tc-source {
    font-family: var(--font-mono);
    font-size: 20px;
    color: var(--color-text);
    padding: 10px 14px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid var(--color-code-border);
    border-radius: 8px;
  }

  .tc-arrow {
    font-size: 22px;
    color: var(--color-ai-mid);
    text-align: center;
  }

  .tc-tokens {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    align-items: center;
  }

  .tc-tok {
    font-family: var(--font-mono);
    font-size: 18px;
    padding: 5px 10px;
    border-radius: 6px;
    letter-spacing: 0.02em;
    white-space: pre;
  }

  .tc-tok[data-kind='0'] {
    background: rgba(168, 85, 247, 0.2);
    color: var(--color-text);
    border: 1px solid rgba(168, 85, 247, 0.4);
  }

  .tc-tok[data-kind='1'] {
    background: rgba(236, 72, 153, 0.18);
    color: var(--color-text);
    border: 1px solid rgba(236, 72, 153, 0.4);
  }

  .tc-count {
    margin-left: 12px;
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .tc-foot {
    padding: 16px 26px 22px;
    border-top: 1px solid var(--color-border);
    font-size: 20px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  /* === Callout / closer - same family as context-engineering. ========= */

  .callout {
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-md);
    padding: 22px 28px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: fade-in 0.4s ease-out;
  }

  .callout.accent {
    border-color: var(--color-tool-border);
    background: rgba(168, 85, 247, 0.08);
  }

  .co-label {
    font-family: var(--font-mono);
    font-size: 16px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  .co-body {
    margin: 0;
    font-size: 24px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .closer {
    border: 1px solid var(--color-tool-border);
    background: rgba(168, 85, 247, 0.08);
    border-radius: var(--radius-lg);
    padding: 30px 34px;
    animation: fade-in 0.5s ease-out;
  }

  .cl-label {
    font-family: var(--font-mono);
    font-size: 17px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
    margin-bottom: 18px;
  }

  .cl-body {
    margin: 0;
    font-size: 28px;
    line-height: 1.45;
    color: var(--color-text);
    font-weight: 400;
  }

  /* === Chart card ====================================================== */

  .chart-card {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 26px 30px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: fade-in 0.45s ease-out;
  }

  .cc-legend {
    display: grid;
    grid-template-columns: 130px 1fr 240px;
    gap: 24px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .leg-equiv {
    grid-column: 3 / 4;
  }

  .tier {
    display: grid;
    grid-template-columns: 130px 1fr 240px;
    gap: 24px;
    align-items: center;
    padding: 10px 0;
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity 0.55s ease,
      transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .tier.shown {
    opacity: 1;
    transform: translateY(0);
  }

  .tier-label {
    font-family: var(--font-mono);
    font-size: 30px;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: var(--color-text);
  }

  .tier.frontier .tier-label {
    background: var(--gradient-headline);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-weight: 600;
  }

  .tier-bar-track {
    height: 22px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 6px;
    border: 1px solid var(--color-border);
    overflow: hidden;
    position: relative;
  }

  .tier-bar {
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(168, 85, 247, 0.6),
      rgba(236, 72, 153, 0.6)
    );
    border-radius: 5px;
    transform-origin: left center;
    transform: scaleX(0);
    transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .tier.shown .tier-bar {
    transform: scaleX(1);
  }

  .tier.frontier .tier-bar {
    background: var(--gradient-accent);
    box-shadow: 0 0 32px -4px rgba(236, 72, 153, 0.45);
  }

  .tier-equiv {
    font-size: 19px;
    line-height: 1.4;
    color: var(--color-text-muted);
  }

  .tier.frontier .tier-equiv {
    color: var(--color-text);
  }

  /* === Takeaways rail + column shift - identical to chat/LLM/CE. ===== */

  .tail-spacer {
    height: 240px;
  }

  .tok-root .segment-header,
  .tok-root .tok-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .tok-root.two-col .segment-header,
  .tok-root.two-col .tok-column {
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
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
