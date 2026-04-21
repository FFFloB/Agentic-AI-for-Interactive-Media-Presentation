<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { careWrongStage } from './stage.svelte';

  let { segmentId = 'care-wrong' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, careWrongStage));
  onDestroy(() => unregisterStage(segmentId));

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    { at: 2, text: 'Fluency and confidence are not evidence. Verify everything that matters.' },
    { at: 4, text: 'The subtle failures are the dangerous ones - they pass the first glance.' },
    { at: 6, text: 'Thinking and tools reduce errors; they do not remove them. Verification stays yours.' },
  ];
  const takeawaysActive = $derived(careWrongStage.reveal(takeaways[0].at));

  let rootEl: HTMLDivElement;
  function offsetWithin(el: HTMLElement, stopAt: HTMLElement): { x: number; y: number } {
    let x = 0, y = 0;
    let cur: HTMLElement | null = el;
    while (cur && cur !== stopAt) {
      x += cur.offsetLeft; y += cur.offsetTop;
      cur = cur.offsetParent as HTMLElement | null;
    }
    return { x, y };
  }
  $effect(() => {
    const _ = careWrongStage.stageIndex;
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
</script>

<div
  class="cw-root"
  class:two-col={takeawaysActive}
  bind:this={rootEl}
  data-segment-root
>
  <aside
    class="right-rail"
    class:visible={takeawaysActive}
    style:transform="translateY({railTopY}px)"
  >
    <div class="rr-label" class:visible={takeawaysActive}>Takeaways</div>
    <ol class="takeaways">
      {#each takeaways as item, i (item.at)}
        <li class="takeaway" class:shown={careWrongStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Mechanical · Limits</span>
    <h1 class="headline-gradient">Confidently wrong</h1>
    <p class="subhead">
      Even with thinking and tools, the agent will occasionally
      produce work that looks right and isn't. The dangerous
      failures are the ones that pass the first glance.
    </p>
  </header>

  <div class="cw-column">
    <!-- Stage 1 - framing -->
    {#if careWrongStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          Surely if it thinks step by step, it gets it right?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - the obvious failure [TAKEAWAY 1] -->
    {#if careWrongStage.reveal(2)}
      <div class="failure-card" data-staged="true">
        <div class="fc-head">
          <span class="fc-badge obvious">Obvious failure</span>
          <span class="fc-title">A layout that looks fine.</span>
        </div>
        <div class="fc-body">
          <p class="fc-setup">
            You ask the agent to design a three-column product card.
            It gives you something polished on the first pass:
          </p>
          <div class="fc-example good">
            <span class="fc-example-label">What it gave you</span>
            <ul>
              <li>Three columns, aligned, even gaps.</li>
              <li>Proper typographic scale, consistent radius.</li>
              <li>Subtle shadow, sensible colour choices.</li>
            </ul>
          </div>
          <div class="fc-example bad">
            <span class="fc-example-label">What you find when you look</span>
            <ul>
              <li>Primary action and secondary action are the same visual weight.</li>
              <li>Price is smaller than the sub-copy. Nobody scanning will find it.</li>
              <li>Hover states confirm rather than invite.</li>
            </ul>
          </div>
          <p class="fc-verdict">
            The surface was right. The decisions were not. You only
            catch this by looking at the decisions, not at the
            surface.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 3 - explanation of why fluency deceives -->
    {#if careWrongStage.reveal(3)}
      <div class="callout" data-staged="true">
        <div class="co-label">Why fluency is such a good disguise</div>
        <p class="co-body">
          The agent was trained to produce output that reads well.
          That training is not a proxy for correctness - it is a
          proxy for plausibility. When the two align, you get good
          work. When they diverge, you get confident nonsense
          delivered in confident prose.
        </p>
      </div>
    {/if}

    <!-- Stage 4 - the subtle failure [TAKEAWAY 2] -->
    {#if careWrongStage.reveal(4)}
      <div class="failure-card" data-staged="true">
        <div class="fc-head">
          <span class="fc-badge subtle">Subtle failure</span>
          <span class="fc-title">Accessibility that "looks fine".</span>
        </div>
        <div class="fc-body">
          <p class="fc-setup">
            You ask for a palette that pairs warm cream with muted
            terracotta. The agent returns:
          </p>
          <div class="fc-swatches">
            <div class="fc-swatch" style:background="#F5EDDC">
              <span class="fc-sw-label">#F5EDDC</span>
              <span class="fc-sw-role">Background</span>
            </div>
            <div class="fc-swatch" style:background="#C97A57">
              <span class="fc-sw-label" style:color="#fff">#C97A57</span>
              <span class="fc-sw-role" style:color="rgba(255,255,255,0.75)">Text on background</span>
            </div>
          </div>
          <div class="fc-result">
            <span class="fc-result-label">The numbers</span>
            <span class="fc-result-value">Contrast ratio 3.2:1 - below WCAG AA for body text.</span>
          </div>
          <p class="fc-verdict">
            It feels elegant. It reads fine to most people in the
            room. It will fail for any of your users over fifty,
            anyone in bright light, anyone with reduced vision. The
            agent never mentioned that, because fluency is its job,
            not accessibility.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 5 - why even thinking + tools don't fix it -->
    {#if careWrongStage.reveal(5)}
      <div class="mitigation-card" data-staged="true">
        <div class="mc-head">
          <span class="mc-badge">What helps</span>
          <span class="mc-title">Thinking and tools narrow the gap. They do not close it.</span>
        </div>
        <div class="mc-body">
          <p>
            Giving the agent a thinking phase reduces obvious errors.
            Giving it tools to check its work catches more. But the
            agent is still the one deciding when to stop checking,
            when to call something good enough, when to trust its
            own previous reasoning.
          </p>
          <div class="mc-rules">
            <div class="mc-rule">
              <span class="mr-num">01</span>
              <span class="mr-body">
                <strong>Decide what "correct" means</strong> before
                you look at the output. Accessibility ratios.
                Typographic hierarchy. User-flow step counts.
                Measure against that, not against the vibe.
              </span>
            </div>
            <div class="mc-rule">
              <span class="mr-num">02</span>
              <span class="mr-body">
                <strong>Build the check into the loop</strong>. Ask
                for the contrast ratio along with the palette. Ask
                for the unit test along with the function. Cheap
                verification runs at the same time as generation.
              </span>
            </div>
            <div class="mc-rule">
              <span class="mr-num">03</span>
              <span class="mr-body">
                <strong>Keep a human gate on anything subtle</strong>.
                Visual hierarchy, emotional tone, accessibility,
                safety - these are where subtle failures live. Do not
                ship them un-reviewed.
              </span>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 6 - closer [TAKEAWAY 3] -->
    {#if careWrongStage.reveal(6)}
      <div class="closer" data-staged="true">
        <div class="cl-label">The one reliable signal</div>
        <p class="cl-body">
          Fluency tells you the agent is working. Correctness is a
          separate question, and the agent cannot reliably answer
          it about itself. Stay sceptical of anything that felt too
          easy.
        </p>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  .cw-root {
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

  .cw-column {
    width: min(880px, 100%);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

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
    font-size: 28px;
    line-height: 1.5;
  }

  .callout {
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-md);
    padding: 24px 30px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: fade-in 0.45s ease-out;
  }
  .co-label {
    font-family: var(--font-mono);
    font-size: 16px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .co-body {
    margin: 0;
    font-size: 25px;
    line-height: 1.5;
    color: var(--color-text);
  }

  /* === Failure card - the core visual for this segment ============== */

  .failure-card {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: fade-in 0.5s ease-out;
  }

  .fc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .fc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    padding: 5px 12px;
    border-radius: 6px;
  }

  .fc-badge.obvious {
    background: rgba(245, 158, 11, 0.75);
  }

  .fc-badge.subtle {
    background: rgba(248, 113, 113, 0.75);
  }

  .fc-title {
    font-family: var(--font-sans);
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--color-text);
  }

  .fc-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .fc-setup {
    margin: 0;
    font-size: 22px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .fc-example {
    padding: 18px 22px;
    border-radius: 10px;
    border: 1px solid var(--color-border);
  }

  .fc-example.good {
    background: rgba(74, 222, 128, 0.06);
    border-left: 3px solid rgba(74, 222, 128, 0.55);
  }

  .fc-example.bad {
    background: rgba(248, 113, 113, 0.06);
    border-left: 3px solid rgba(248, 113, 113, 0.55);
  }

  .fc-example-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    display: block;
    margin-bottom: 10px;
  }

  .fc-example.good .fc-example-label {
    color: var(--color-success);
  }

  .fc-example.bad .fc-example-label {
    color: var(--color-error);
  }

  .fc-example ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .fc-example li {
    font-size: 20px;
    line-height: 1.5;
    color: var(--color-text);
    padding-left: 18px;
    position: relative;
  }

  .fc-example li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.65em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.4;
  }

  /* Swatches demo for subtle failure card */
  .fc-swatches {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .fc-swatch {
    padding: 32px 22px;
    border-radius: 10px;
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .fc-sw-label {
    font-family: var(--font-mono);
    font-size: 18px;
    color: rgba(0, 0, 0, 0.78);
    letter-spacing: 0.04em;
  }

  .fc-sw-role {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.55);
  }

  .fc-result {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 18px;
    align-items: baseline;
    padding: 14px 18px;
    background: rgba(248, 113, 113, 0.08);
    border: 1px solid rgba(248, 113, 113, 0.3);
    border-radius: 10px;
  }

  .fc-result-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-error);
  }

  .fc-result-value {
    font-family: var(--font-mono);
    font-size: 20px;
    color: var(--color-text);
  }

  .fc-verdict {
    margin: 4px 0 0 0;
    font-size: 22px;
    line-height: 1.55;
    color: var(--color-text);
    padding-top: 6px;
    border-top: 1px dashed var(--color-border);
  }

  /* === Mitigation card ============================================= */

  .mitigation-card {
    border: 1px solid var(--color-tool-border);
    background:
      linear-gradient(180deg, rgba(168, 85, 247, 0.08), transparent 60%),
      rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    animation: fade-in 0.55s ease-out;
  }

  .mc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .mc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .mc-title {
    font-family: var(--font-sans);
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
    line-height: 1.25;
  }

  .mc-body {
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .mc-body > p {
    margin: 0;
    font-size: 22px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .mc-rules {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mc-rule {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 18px;
    align-items: baseline;
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .mr-num {
    font-family: var(--font-mono);
    font-size: 22px;
    color: var(--color-ai-mid);
    letter-spacing: 0.08em;
  }

  .mr-body {
    font-size: 21px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .mr-body strong {
    color: var(--color-text);
    font-weight: 600;
  }

  /* === Closer ===================================================== */

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
    margin-bottom: 16px;
  }

  .cl-body {
    margin: 0;
    font-size: 26px;
    line-height: 1.5;
    color: var(--color-text);
  }

  /* Takeaways rail */

  .tail-spacer {
    height: 240px;
  }

  .cw-root .segment-header,
  .cw-root .cw-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .cw-root.two-col .segment-header,
  .cw-root.two-col .cw-column {
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
    transition: opacity 0.5s ease, transform 0.5s ease;
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
