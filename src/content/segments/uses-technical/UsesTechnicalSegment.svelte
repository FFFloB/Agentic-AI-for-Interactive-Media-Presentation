<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { usesTechnicalStage } from './stage.svelte';

  let { segmentId = 'uses-technical' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, usesTechnicalStage));
  onDestroy(() => unregisterStage(segmentId));

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    { at: 3, text: 'Review, documentation and tests - the "we should really do this" work - actually gets done.' },
    { at: 6, text: 'Whole modules can be delegated. You define the interface, the constraints, and the tests. The agent does the grind.' },
    { at: 9, text: 'Security and safety audits are no longer specialist-gated. Anyone on the team can kick one off.' },
  ];

  const takeawaysActive = $derived(usesTechnicalStage.reveal(takeaways[0].at));

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
    const _ = usesTechnicalStage.stageIndex;
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
      badge: 'UX',
      title: 'Do the UX work you used to wait for',
      body: 'You can finally build a usable interface without waiting on design cycles. Not "Bootstrap default", but something considered - flows, affordances, empty states.',
      example: '"Design the settings screens for this app. Match the visual language already used in Home."',
    },
    {
      stage: 3,
      badge: 'CR',
      title: 'Review your own code before anyone else has to',
      body: 'Hand the agent the diff. It flags duplication, weak naming, edge cases you missed, tests you forgot. Cheaper rounds than pushing to someone else.',
      example: '"Review this PR. Look for edge cases I missed and tests that should exist but do not."',
    },
    {
      stage: 4,
      badge: 'DC',
      title: 'Documentation that keeps up',
      body: 'READMEs, API docs, architectural notes, change logs. The work that always loses to the next feature - kept current by the agent that just wrote the feature.',
      example: '"Update the README to reflect the new config options. Add examples for each."',
    },
    {
      stage: 5,
      badge: 'MD',
      title: 'Delegate whole modules',
      body: 'You define the interface, the constraints, the acceptance tests. The agent plans and implements the guts, then reports back when the tests pass. You review.',
      example: '"Implement the billing module. Public interface in src/billing/index.ts. Must pass tests in billing.spec.ts."',
    },
    {
      stage: 6,
      badge: 'CI',
      title: 'Test, build and deploy',
      body: 'CI pipelines, infra-as-code, release scripts. The agent wires up what used to eat a weekend, and stays on hand when it breaks.',
      example: '"Set up GitHub Actions to run tests on every push and deploy to staging on merge to main."',
    },
    {
      stage: 7,
      badge: 'BE',
      title: 'Backend and data layer',
      body: 'APIs, schemas, queries, caching, migrations. Well-trodden ground where the agent is strong. You supply the business rules and the tradeoffs.',
      example: '"Add a rate-limited endpoint at POST /api/export. Returns the user\'s data as CSV. Audit-logged."',
    },
    {
      stage: 8,
      badge: 'SEC',
      title: 'Security and safety audits',
      body: 'OWASP-style sweeps of the code, data-handling reviews, dependency audits, penetration checks. Kick one off when you change something sensitive, not once a year.',
      example: '"Audit the auth flow for common vulnerabilities. Focus on session handling and password reset."',
      emphasis: true,
    },
  ];
</script>

<div
  class="ut-root"
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
        <li class="takeaway" class:shown={usesTechnicalStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Use cases · Engineering</span>
    <h1 class="headline-gradient">If you build</h1>
    <p class="subhead">
      Good places to put agentic AI to work if code is your craft -
      from the parts you used to skip to the parts you used to dread.
    </p>
  </header>

  <div class="ut-column">
    {#if usesTechnicalStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          I can code. Where does agentic AI actually earn its keep in
          my day?
        </div>
      </div>
    {/if}

    {#each uses as use (use.stage)}
      {#if usesTechnicalStage.reveal(use.stage)}
        <div class="use-card" class:emphasis={use.emphasis} data-staged="true">
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

    {#if usesTechnicalStage.reveal(9)}
      <div class="closer" data-staged="true">
        <div class="cl-label">What this changes</div>
        <p class="cl-body">
          The interesting parts of the job - the architecture calls, the
          tradeoffs, the review, the judgement - stay yours. The work
          around them, the documentation and testing and wiring, becomes
          a background task that actually gets done.
        </p>
      </div>
    {/if}

    {#if usesTechnicalStage.reveal(10)}
      <div class="callout warn" data-staged="true">
        <div class="co-label">A gentle warning</div>
        <p class="co-body">
          You are still responsible for what ships under your name.
          Review the agent's work like a junior's PR - assume good
          intent, trust nothing unchecked, and never skip the parts
          that keep people safe.
        </p>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  .ut-root {
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

  .ut-column {
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

  /* === Use card - same shape as the design segment for visual family. */

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

  .use-card.emphasis {
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
    min-width: 54px;
    height: 54px;
    padding: 0 14px;
    border-radius: 14px;
    background: var(--gradient-accent);
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.06em;
    box-shadow: 0 10px 24px -10px rgba(236, 72, 153, 0.55);
  }

  .uc-title {
    font-family: var(--font-sans);
    font-size: 32px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.15;
    color: var(--color-text);
  }

  .use-card.emphasis .uc-title {
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
    font-size: 18px;
    line-height: 1.5;
    color: var(--color-text);
  }

  /* === Closer + callout ============================================= */

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

  /* === Takeaways rail + column shift ============================== */

  .ut-root .segment-header,
  .ut-root .ut-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .ut-root.two-col .segment-header,
  .ut-root.two-col .ut-column {
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
