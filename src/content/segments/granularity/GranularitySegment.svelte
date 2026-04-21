<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { granularityStage } from './stage.svelte';
  import { mode } from '$content/mode.svelte';

  let { segmentId = 'granularity' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, granularityStage));
  onDestroy(() => unregisterStage(segmentId));

  // === Takeaways rail ==================================================

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    { at: 3, text: 'Delegation scales from seconds to hours. Micro, medium and macro tasks all coexist in a single day.' },
    { at: 5, text: 'The ceiling keeps moving. Work that felt ambitious last year is routine now.' },
    { at: 6, text: 'You pick the mix. A micro-fix here, a macro-delegation there. Nothing forces the choice.' },
  ];

  const takeawaysActive = $derived(granularityStage.reveal(takeaways[0].at));

  // === Auto-scroll =====================================================

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
    const _ = granularityStage.stageIndex;
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

  // === Tier content ====================================================
  //
  // Convention: headlines / subheadlines / blurbs / takeaways are the
  // common denominator and live in plain (non-mode) text - the user
  // hand-authors them. Only the *example asks* per tier and the mix chips
  // pivot by audience.

  type ExamplesByTier = { micro: string[]; medium: string[]; macro: string[] };

  const technicalExamples: ExamplesByTier = {
    micro: [
      `"What's wrong with this function?"`,
      `"Write me a regex that matches IP addresses."`,
      `"Explain this stack trace."`,
    ],
    medium: [
      `"Design a new UX for editing todo items in my list app."`,
      `"Refactor this component to use the new data hook."`,
      `"Draft the onboarding copy for the sign-up flow."`,
    ],
    macro: [
      `"Implement the entire todo app and cut release candidates for Android and iOS."`,
      `"Port this library from Python to TypeScript, tests and docs included."`,
      `"Audit the codebase for accessibility issues and fix what you can."`,
    ],
  };

  const designExamples: ExamplesByTier = {
    micro: [
      `"What's off with the spacing in this button group?"`,
      `"Suggest a palette that reads calm and focused."`,
      `"Critique the visual hierarchy on this screen."`,
    ],
    medium: [
      `"Design a new empty state for the Plate meal-planner screen."`,
      `"Rework this card to handle longer titles and missing images."`,
      `"Draft a friendlier first-run experience for Plate."`,
    ],
    macro: [
      `"Redesign the recipe browse + detail flow. Mobile and desktop, all states."`,
      `"Brand a companion app end-to-end: logo, tokens, core screens, launch page."`,
      `"Audit the entire product for accessibility and produce a prioritised fix list."`,
    ],
  };

  const examplesByTier = $derived(
    mode.current === 'design' ? designExamples : technicalExamples,
  );

  // Blurbs stay identical between modes (messaging, not exemplars).
  const tiers = $derived([
    {
      stage: 3,
      scale: 'micro',
      duration: 'seconds',
      blurb:
        'Tiny, specific asks. The kind of small request you can accept, discard, or iterate on in a breath.',
      examples: examplesByTier.micro,
    },
    {
      stage: 4,
      scale: 'medium',
      duration: 'minutes',
      blurb:
        'Scoped work. One piece of a larger thing - a screen, a component, a document. You still sit with it, but the grunt work is lifted.',
      examples: examplesByTier.medium,
    },
    {
      stage: 5,
      scale: 'macro',
      duration: 'hours',
      blurb:
        'A whole project, or a big slab of one. You define the target, the agent plans and grinds through multi-step work while you check in.',
      examples: examplesByTier.macro,
    },
  ]);

  // Mix chips at stage 6.
  type MixExample = { badge: 'micro' | 'medium' | 'macro'; text: string };
  const mixExamples = $derived<MixExample[]>(
    mode.current === 'design'
      ? [
          { badge: 'micro', text: 'quick palette tweak' },
          { badge: 'medium', text: 'new settings screen' },
          { badge: 'macro', text: 'overnight redesign of onboarding' },
        ]
      : [
          { badge: 'micro', text: 'quick grep across the docs' },
          { badge: 'medium', text: 'new settings screen' },
          { badge: 'macro', text: 'overnight migration' },
        ],
  );
</script>

<div
  class="gr-root"
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
        <li class="takeaway" class:shown={granularityStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Granularity</span>
    <h1 class="headline-gradient">A spectrum, not a switch</h1>
    <p class="subhead">
      Agentic AI shows up at every time scale - from seconds of help to
      hours of handed-off work. The size of the ask is a dial, and you
      are the one turning it.
    </p>
  </header>

  <div class="gr-column">
    <!-- Stage 1 - framing -->
    {#if granularityStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          How should I think about where AI fits in a workflow? Is it an
          all-or-nothing thing?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - intro callout -->
    {#if granularityStage.reveal(2)}
      <div class="callout accent" data-staged="true">
        <div class="co-label">Not all-or-nothing</div>
        <p class="co-body">
          Delegation runs along a time axis: <strong>seconds</strong> for
          the tiniest asks, <strong>minutes</strong> for focused work, and
          <strong>hours</strong> for whole-project handoffs. Every step is
          legitimate - the question is just how much scope you pass over.
        </p>
      </div>
    {/if}

    <!-- Stages 3-5 - tier cards -->
    {#each tiers as tier (tier.scale)}
      {#if granularityStage.reveal(tier.stage)}
        <div class="tier-card" data-scale={tier.scale} data-staged="true">
          <div class="tc-head">
            <span class="tc-scale">{tier.scale}</span>
            <span class="tc-sep"></span>
            <span class="tc-duration">{tier.duration}</span>
          </div>
          <p class="tc-blurb">{tier.blurb}</p>
          <ul class="tc-examples">
            {#each tier.examples as ex, i (i)}
              <li>{ex}</li>
            {/each}
          </ul>
        </div>
      {/if}
    {/each}

    <!-- Stage 6 - human in the loop -->
    {#if granularityStage.reveal(6)}
      <div class="mix-card" data-staged="true">
        <div class="mx-label">You control the mix</div>
        <p class="mx-body">
          Nothing about agentic AI forces a scale. The same person, in the
          same hour, can answer a support ticket with a micro lookup,
          reshape a component at the medium tier, and kick off an
          overnight macro job.
        </p>
        <div class="mx-examples">
          {#each mixExamples as ex (ex.text)}
            <div class="mx-ex">
              <span class="mx-badge {ex.badge}">
                {#if ex.badge === 'micro'}µ{:else if ex.badge === 'medium'}m{:else}H{/if}
              </span>
              {ex.text}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Stage 7 - closer -->
    {#if granularityStage.reveal(7)}
      <div class="closer" data-staged="true">
        <div class="cl-label">Where this leaves us</div>
        <p class="cl-body">
          The interesting question is no longer "can the agent do this?"
          It is "how big a bite do I want to hand over today, and what
          do I want to keep?"
        </p>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  /* === Shared layout (matches chat/LLM/CE/tokens segments) =========== */

  .gr-root {
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

  .gr-column {
    width: min(880px, 100%);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  /* Bubbles + callouts --------------------------------------------- */

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
    font-size: 25px;
    line-height: 1.5;
    color: var(--color-text);
  }
  .co-body strong {
    color: var(--color-ai-mid);
    font-weight: 600;
  }

  /* === Tier cards - three scales. Visual weight grows with duration. === */

  .tier-card {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: fade-in 0.5s ease-out;
    position: relative;
    overflow: hidden;
  }

  /* Each scale gets a progressively richer accent treatment so they read
     as a progression at a glance. */
  .tier-card[data-scale='micro'] {
    border-left: 3px solid rgba(59, 130, 246, 0.6);
  }
  .tier-card[data-scale='medium'] {
    border-left: 3px solid rgba(168, 85, 247, 0.7);
    background:
      linear-gradient(90deg, rgba(168, 85, 247, 0.04), transparent 40%),
      rgba(255, 255, 255, 0.02);
  }
  .tier-card[data-scale='macro'] {
    border-left: 3px solid rgba(236, 72, 153, 0.8);
    background:
      linear-gradient(90deg, rgba(236, 72, 153, 0.08), transparent 45%),
      rgba(255, 255, 255, 0.02);
    box-shadow: 0 24px 64px -32px rgba(236, 72, 153, 0.3);
  }

  .tc-head {
    display: flex;
    align-items: baseline;
    gap: 18px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
  }

  .tc-scale {
    font-family: var(--font-sans);
    font-size: 44px;
    font-weight: 600;
    letter-spacing: -0.02em;
    text-transform: capitalize;
    background: var(--gradient-headline);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .tc-sep {
    width: 1px;
    align-self: stretch;
    background: var(--color-border);
  }

  .tc-duration {
    font-family: var(--font-mono);
    font-size: 20px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .tc-blurb {
    margin: 0;
    font-size: 24px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .tc-examples {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .tc-examples li {
    font-family: var(--font-mono);
    font-size: 19px;
    line-height: 1.5;
    color: var(--color-text-muted);
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid var(--color-code-border);
    border-radius: 8px;
  }

  /* === Mix card ===================================================== */

  .mix-card {
    border: 1px solid var(--color-tool-border);
    background: rgba(168, 85, 247, 0.08);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    animation: fade-in 0.5s ease-out;
  }

  .mx-label {
    font-family: var(--font-mono);
    font-size: 17px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
    margin-bottom: 16px;
  }

  .mx-body {
    margin: 0 0 22px 0;
    font-size: 26px;
    line-height: 1.45;
    color: var(--color-text);
  }

  .mx-examples {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .mx-ex {
    display: flex;
    align-items: center;
    gap: 18px;
    font-size: 22px;
    color: var(--color-text-muted);
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }

  .mx-badge {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 18px;
    font-weight: 600;
    color: white;
  }
  .mx-badge.micro {
    background: rgba(59, 130, 246, 0.6);
  }
  .mx-badge.medium {
    background: rgba(168, 85, 247, 0.7);
  }
  .mx-badge.macro {
    background: var(--gradient-accent);
  }

  /* === Closer ====================================================== */

  .closer {
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-md);
    padding: 28px 32px;
    animation: fade-in 0.5s ease-out;
  }

  .cl-label {
    font-family: var(--font-mono);
    font-size: 16px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
    margin-bottom: 14px;
  }

  .cl-body {
    margin: 0;
    font-size: 28px;
    line-height: 1.45;
    color: var(--color-text);
    font-weight: 400;
  }

  /* === Takeaways rail + column shift ================================== */

  .tail-spacer {
    height: 240px;
  }

  .gr-root .segment-header,
  .gr-root .gr-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .gr-root.two-col .segment-header,
  .gr-root.two-col .gr-column {
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
