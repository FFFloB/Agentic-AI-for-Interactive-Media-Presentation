<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { careVisualGapStage } from './stage.svelte';

  let { segmentId = 'care-visual-gap' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, careVisualGapStage));
  onDestroy(() => unregisterStage(segmentId));

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    { at: 2, text: 'The agent can observe a UI. It cannot experience one.' },
    { at: 4, text: 'Code can run on autopilot. Visual work needs your hands on the wheel.' },
    { at: 6, text: 'Experience is where your judgment matters. Put your best hours there.' },
  ];
  const takeawaysActive = $derived(careVisualGapStage.reveal(takeaways[0].at));

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
    const _ = careVisualGapStage.stageIndex;
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
  class="vg-root"
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
        <li class="takeaway" class:shown={careVisualGapStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Mechanical · Limits</span>
    <h1 class="headline-gradient">The visual gap</h1>
    <p class="subhead">
      For code, the agent closes its own feedback loop. It writes,
      runs, reads the error, fixes it, again and again, until the
      tests pass. For anything visual, animated, or interactive, that
      loop runs through your eyes.
    </p>
  </header>

  <div class="vg-column">
    <!-- Stage 1 - framing -->
    {#if careVisualGapStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          Can it see what it is building?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - what it CAN do (including the honest caveat) [TAKEAWAY 1] -->
    {#if careVisualGapStage.reveal(2)}
      <div class="capability-card" data-staged="true">
        <div class="cc-head">
          <span class="cc-badge">What the agent can observe</span>
        </div>
        <div class="cc-rows">
          <div class="cc-row ok">
            <span class="cc-dot"></span>
            <div class="cc-row-body">
              <span class="cc-row-title">Still images</span>
              <span class="cc-row-detail">
                Screenshots, mockups, reference art. Read with the same
                fluency as text. Good enough for layout, hierarchy,
                colour, composition.
              </span>
            </div>
          </div>
          <div class="cc-row ok">
            <span class="cc-dot"></span>
            <div class="cc-row-body">
              <span class="cc-row-title">Video, sampled</span>
              <span class="cc-row-detail">
                Some models accept video. Internally it is a sparse
                stack of frames. Enough to describe what happens, not
                enough to feel how it feels.
              </span>
            </div>
          </div>
          <div class="cc-row ok">
            <span class="cc-dot"></span>
            <div class="cc-row-body">
              <span class="cc-row-title">UI autopilot</span>
              <span class="cc-row-detail">
                Modern agent tools can drive a real browser or app:
                screenshot, reason, click, screenshot again. The loop
                runs in seconds, not milliseconds. It is observing a
                UI through a periodic keyhole.
              </span>
            </div>
          </div>
        </div>
        <p class="cc-foot">
          So yes, the agent can see the screen. What it cannot do is
          perceive the screen the way you do.
        </p>
      </div>
    {/if}

    <!-- Stage 3 - the gap: observation is not experience -->
    {#if careVisualGapStage.reveal(3)}
      <div class="gap-card" data-staged="true">
        <div class="gc-head">
          <span class="gc-badge">What sampling misses</span>
          <span class="gc-title">Observation is not experience.</span>
        </div>
        <div class="gc-rows">
          <div class="gc-row">
            <span class="gc-label">Motion feel</span>
            <span class="gc-detail">
              Easing, tempo, the difference between "snappy" and
              "twitchy". Two animations with identical timing charts
              can feel wildly different. A screenshot every two
              seconds cannot tell them apart.
            </span>
          </div>
          <div class="gc-row">
            <span class="gc-label">Flow</span>
            <span class="gc-detail">
              Whether a transition carries you forward or jolts you.
              Whether a loading state rewards patience or burns it.
              This lives in seconds of continuous watching, not a
              before/after pair of frames.
            </span>
          </div>
          <div class="gc-row">
            <span class="gc-label">Tactility</span>
            <span class="gc-detail">
              Hover delay, press-in depth, the half-second between
              tap and response. A UI feels alive when these match
              your hand and dead when they do not. The agent has no
              hand.
            </span>
          </div>
          <div class="gc-row">
            <span class="gc-label">Interactivity</span>
            <span class="gc-detail">
              Does the button invite a press? Does the form catch you
              when you fumble? Does the game loop pull you in? These
              are experiences across time. Stills cannot hold them.
            </span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 4 - the contrast with code [TAKEAWAY 2] -->
    {#if careVisualGapStage.reveal(4)}
      <div class="compare-card" data-staged="true">
        <div class="cp-head">
          <span class="cp-badge">Two tasks, two loops</span>
        </div>
        <div class="cp-cols">
          <div class="cp-col code">
            <div class="cp-col-head">
              <span class="cp-col-tag">Mechanical code</span>
              <span class="cp-col-verdict">Closed loop</span>
            </div>
            <ul class="cp-bullets">
              <li>Writes code.</li>
              <li>Runs tests. Reads failures.</li>
              <li>Fixes. Runs again.</li>
              <li>Repeats until green.</li>
              <li>You check in at milestones.</li>
            </ul>
            <p class="cp-col-foot">
              Stunning complexity shipped while you do something else.
            </p>
          </div>
          <div class="cp-col visual">
            <div class="cp-col-head">
              <span class="cp-col-tag">Visual / UX / motion</span>
              <span class="cp-col-verdict">Open loop</span>
            </div>
            <ul class="cp-bullets">
              <li>Writes the markup, styles, animation.</li>
              <li>Cannot feel the result.</li>
              <li>You watch it run.</li>
              <li>You describe what is wrong.</li>
              <li>Repeat until it feels right.</li>
            </ul>
            <p class="cp-col-foot">
              The loop closes only through your eyes. The agent is the
              hands; you are still the judgement.
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 5 - put your effort where judgment matters -->
    {#if careVisualGapStage.reveal(5)}
      <div class="rubric-card" data-staged="true">
        <div class="rc-head">
          <span class="rc-badge">Where your effort matters</span>
          <span class="rc-title">Put your best hours into the experiential layer.</span>
        </div>
        <p class="rc-intro">
          The agent covers more of the mechanical every year. That is
          a gift to spend, not a threat to absorb. The hours you save
          on scaffolding are hours you can spend where your ambition,
          your sense of design, your UX engineering, and your
          knowledge of users do the real work - in the experiential
          layer. This was already where good interactive media
          distinguished itself from mediocre. It is more true now, not
          less.
        </p>
        <div class="rc-rows">
          <div class="rc-row">
            <span class="rc-tier">Delegate with autonomy</span>
            <span class="rc-body">
              Build systems, data pipelines, APIs, refactors, tests.
              Let the agent run. Review at the commit.
            </span>
          </div>
          <div class="rc-row mid">
            <span class="rc-tier">Delegate, then verify</span>
            <span class="rc-body">
              Static layouts, colour, typography, component structure.
              Fast review, light notes, continue.
            </span>
          </div>
          <div class="rc-row">
            <span class="rc-tier">Invest your hours</span>
            <span class="rc-body">
              Experience, motion, interaction feel, game feel,
              audio-visual sync, user empathy, UX engineering. Short
              loops, many iterations, your taste in the driver's seat.
              This is where the real value of your work now lives.
            </span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 6 - closer [TAKEAWAY 3] -->
    {#if careVisualGapStage.reveal(6)}
      <div class="closer" data-staged="true">
        <div class="cl-label">A principle you can carry</div>
        <p class="cl-body">
          Wherever the work lives in time, you are still the
          instrument that senses it. Delegate around you; do not
          delegate through you. The visual call is a human call, on
          purpose.
        </p>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  .vg-root {
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

  .vg-column {
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

  /* === Capability card (what it CAN do) ============================== */

  .capability-card {
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: fade-in 0.5s ease-out;
  }

  .cc-head {
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border);
  }

  .cc-badge {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-success);
  }

  .cc-rows {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .cc-row {
    display: grid;
    grid-template-columns: 14px 1fr;
    gap: 16px;
    align-items: baseline;
    padding: 16px 20px;
    background: rgba(74, 222, 128, 0.04);
    border: 1px solid rgba(74, 222, 128, 0.25);
    border-radius: 10px;
  }

  .cc-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-success);
    margin-top: 10px;
  }

  .cc-row-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .cc-row-title {
    font-family: var(--font-sans);
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  .cc-row-detail {
    font-size: 20px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .cc-foot {
    margin: 0;
    padding-top: 6px;
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
    font-style: italic;
  }

  /* === Gap card (what sampling misses) =============================== */

  .gap-card {
    border: 1px solid rgba(248, 113, 113, 0.4);
    background: rgba(248, 113, 113, 0.04);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    animation: fade-in 0.5s ease-out;
  }

  .gc-head {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
  }

  .gc-badge {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-error);
  }

  .gc-title {
    font-family: var(--font-sans);
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--color-text);
  }

  .gc-rows {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .gc-row {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 20px;
    padding: 16px 20px;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.2);
  }

  .gc-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-error);
    padding-top: 4px;
  }

  .gc-detail {
    font-size: 21px;
    line-height: 1.5;
    color: var(--color-text);
  }

  /* === Compare card (code vs visual) ================================= */

  .compare-card {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    animation: fade-in 0.55s ease-out;
  }

  .cp-head {
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border);
  }

  .cp-badge {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  .cp-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .cp-col {
    padding: 22px 24px;
    border-radius: 10px;
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .cp-col.code {
    background: rgba(74, 222, 128, 0.05);
    border-color: rgba(74, 222, 128, 0.35);
  }

  .cp-col.visual {
    background: rgba(245, 158, 11, 0.06);
    border-color: rgba(245, 158, 11, 0.4);
  }

  .cp-col-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
  }

  .cp-col-tag {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .cp-col-verdict {
    font-family: var(--font-sans);
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .cp-col.code .cp-col-verdict {
    color: var(--color-success);
  }

  .cp-col.visual .cp-col-verdict {
    color: rgba(245, 158, 11, 1);
  }

  .cp-bullets {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cp-bullets li {
    font-size: 20px;
    line-height: 1.45;
    color: var(--color-text);
    padding-left: 18px;
    position: relative;
  }

  .cp-bullets li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 13px;
    width: 8px;
    height: 2px;
    background: var(--color-text-subtle);
  }

  .cp-col-foot {
    margin: 0;
    padding-top: 6px;
    font-size: 19px;
    line-height: 1.5;
    color: var(--color-text-muted);
    font-style: italic;
  }

  /* === Rubric card (workflow split) ================================== */

  .rubric-card {
    border: 1px solid var(--color-border-strong);
    background:
      linear-gradient(180deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.04)),
      rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-lg);
    padding: 30px 34px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: fade-in 0.55s ease-out;
    box-shadow: 0 24px 64px -24px rgba(168, 85, 247, 0.28);
  }

  .rc-head {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--color-border);
  }

  .rc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .rc-title {
    font-family: var(--font-sans);
    font-size: 30px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--color-text);
  }

  .rc-intro {
    margin: 0;
    font-size: 22px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .rc-rows {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rc-row {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 22px;
    align-items: baseline;
    padding: 18px 22px;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.22);
  }

  .rc-row.mid {
    background: rgba(0, 0, 0, 0.14);
  }

  .rc-tier {
    font-family: var(--font-mono);
    font-size: 16px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  .rc-body {
    font-size: 21px;
    line-height: 1.5;
    color: var(--color-text);
  }

  /* === Closer ======================================================= */

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

  .tail-spacer {
    height: 240px;
  }

  .vg-root .segment-header,
  .vg-root .vg-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .vg-root.two-col .segment-header,
  .vg-root.two-col .vg-column {
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
