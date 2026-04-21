<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { usesDesignStage } from './stage.svelte';

  let { segmentId = 'uses-design' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, usesDesignStage));
  onDestroy(() => unregisterStage(segmentId));

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    { at: 2, text: 'A sketch can become an interactive prototype in minutes, not days.' },
    { at: 4, text: 'Static mockups become testable products. You can validate UX without an engineer in the loop.' },
    { at: 6, text: 'The gap between "I designed this" and "this is shipped" has collapsed - if you are willing to cross it.' },
  ];

  const takeawaysActive = $derived(usesDesignStage.reveal(takeaways[0].at));

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
    const _ = usesDesignStage.stageIndex;
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

  const uses = [
    {
      stage: 2,
      badge: 'P',
      title: 'Stand up a full prototype',
      body: 'Describe a screen, an interaction, a flow. Get back a working prototype with real state and transitions. Good enough to click through in a meeting.',
      example: '"A recipe app with a weekly meal planner and a shopping list that generates itself." → working prototype in minutes.',
    },
    {
      stage: 3,
      badge: 'F',
      title: 'Turn a Figma draft into a testable product',
      body: 'Point at a mockup. The agent wires up the state, the navigation, the data you need to simulate a real user journey - then hands you something you can put in front of testers.',
      example: '"Make this Figma flow clickable with realistic data and a back button on every screen."',
    },
    {
      stage: 4,
      badge: 'Q',
      title: 'UX QA that actually happens',
      body: 'Hand the agent a running product and a brief. It walks the flows, notices what is awkward, broken or missing, and reports back in plain language. You review, you triage.',
      example: '"Run a first-time user through sign-up and checkout. Tell me where it is confusing or breaks."',
    },
    {
      stage: 5,
      badge: '↥',
      title: 'Ship the whole thing',
      body: 'If you dare. Take a design all the way to a real app in a real store. This is no longer a wall you have to throw the work over.',
      example: '"Build this into a production app, set up the store listing, submit for review."',
      dare: true,
    },
  ];
</script>

<div
  class="ud-root"
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
        <li class="takeaway" class:shown={usesDesignStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Use cases · Design</span>
    <h1 class="headline-gradient">If you design</h1>
    <p class="subhead">
      Good places to put agentic AI to work if your craft is design,
      from quick prototypes all the way to shipping what you drew.
    </p>
  </header>

  <div class="ud-column">
    {#if usesDesignStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          My craft is design, not code. Where does AI actually earn its
          keep in my day?
        </div>
      </div>
    {/if}

    {#each uses as use (use.stage)}
      {#if usesDesignStage.reveal(use.stage)}
        <div class="use-card" class:dare={use.dare} data-staged="true">
          <div class="uc-head">
            <span class="uc-badge">{use.badge}</span>
            <span class="uc-title">{use.title}</span>
          </div>
          <p class="uc-body">{use.body}</p>
          <div class="uc-example">
            <span class="uc-ex-label">in practice</span>
            <span class="uc-ex-text">{use.example}</span>
          </div>
        </div>
      {/if}
    {/each}

    {#if usesDesignStage.reveal(6)}
      <div class="closer" data-staged="true">
        <div class="cl-label">What this changes</div>
        <p class="cl-body">
          The boundary between "design" and "implementation" used to be
          a hand-off. For small and medium work it is now a slider you
          control. You still own the intent. The production is just less
          of a bottleneck.
        </p>
      </div>
    {/if}

    {#if usesDesignStage.reveal(7)}
      <div class="callout warn" data-staged="true">
        <div class="co-label">A gentle warning</div>
        <p class="co-body">
          Being able to ship does not mean you should. Prototypes that
          feel "almost there" have a way of becoming production by
          accident. Know when to stop, and when to hand something off.
        </p>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  .ud-root {
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

  .ud-column {
    width: min(880px, 100%);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 28px;
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
    font-size: 26px;
    line-height: 1.5;
  }

  /* === Use card - one per concrete use case. ========================= */

  .use-card {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 26px 30px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: fade-in 0.45s ease-out;
  }

  .use-card.dare {
    border-color: var(--color-tool-border);
    background:
      linear-gradient(180deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.04)),
      rgba(0, 0, 0, 0.2);
    box-shadow: 0 24px 64px -32px rgba(236, 72, 153, 0.32);
  }

  .uc-head {
    display: flex;
    align-items: center;
    gap: 18px;
  }

  .uc-badge {
    flex-shrink: 0;
    width: 54px;
    height: 54px;
    border-radius: 14px;
    background: var(--gradient-accent);
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-sans);
    font-size: 26px;
    font-weight: 600;
    letter-spacing: 0.02em;
    box-shadow: 0 10px 24px -10px rgba(236, 72, 153, 0.55);
  }

  .uc-title {
    font-family: var(--font-sans);
    font-size: 34px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.15;
    color: var(--color-text);
  }

  .use-card.dare .uc-title {
    background: var(--gradient-headline);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .uc-body {
    margin: 0;
    font-size: 23px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .uc-example {
    display: grid;
    grid-template-columns: 130px 1fr;
    gap: 18px;
    align-items: baseline;
    padding: 14px 18px;
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid var(--color-code-border);
    border-radius: 10px;
  }

  .uc-ex-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .uc-ex-text {
    font-family: var(--font-mono);
    font-size: 19px;
    line-height: 1.5;
    color: var(--color-text);
  }

  /* === Closer / callout ============================================= */

  .closer {
    border: 1px solid var(--color-tool-border);
    background: rgba(168, 85, 247, 0.08);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
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
    line-height: 1.45;
    color: var(--color-text);
  }

  .callout {
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-md);
    padding: 22px 28px;
    animation: fade-in 0.4s ease-out;
  }
  .callout.warn {
    border-color: rgba(245, 158, 11, 0.3);
    background: rgba(245, 158, 11, 0.06);
  }
  .co-label {
    font-family: var(--font-mono);
    font-size: 16px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ai-end);
    margin-bottom: 10px;
  }
  .co-body {
    margin: 0;
    font-size: 23px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .tail-spacer {
    height: 240px;
  }

  /* === Takeaways rail + column shift (identical to other segments) === */

  .ud-root .segment-header,
  .ud-root .ud-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .ud-root.two-col .segment-header,
  .ud-root.two-col .ud-column {
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
