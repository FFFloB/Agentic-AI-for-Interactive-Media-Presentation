<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { careAgreementStage } from './stage.svelte';

  let { segmentId = 'care-agreement' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, careAgreementStage));
  onDestroy(() => unregisterStage(segmentId));

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    { at: 2, text: 'The agent tells you what you want to hear. That is a failure mode, not a feature.' },
    { at: 4, text: 'Easy agreement is a red flag, not a compliment.' },
    { at: 7, text: 'Frame for pushback. Put it in memory. Ask twice when the answer came back fast.' },
  ];
  const takeawaysActive = $derived(careAgreementStage.reveal(takeaways[0].at));

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
    const _ = careAgreementStage.stageIndex;
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
  class="cg-root"
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
        <li class="takeaway" class:shown={careAgreementStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Mechanical · Limits</span>
    <h1 class="headline-gradient">The agreement trap</h1>
    <p class="subhead">
      The agent optimises for satisfying its context. Lead it
      slightly, and it goes where you pointed - not where the
      question should have taken you. Lose a critical partner, one
      nod at a time.
    </p>
  </header>

  <div class="cg-column">
    <!-- Stage 1 - framing -->
    {#if careAgreementStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          Why does it always agree with me?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - the failure mode illustrated [TAKEAWAY 1] -->
    {#if careAgreementStage.reveal(2)}
      <div class="failure-card" data-staged="true">
        <div class="fc-head">
          <span class="fc-badge">The failure mode, in slow motion</span>
        </div>
        <div class="fc-exchange">
          <div class="fc-turn user">
            <span class="fc-actor">you</span>
            <span class="fc-text">
              This layout feels a bit cramped. I think we just need
              more spacing on the cards. Can you push the padding to
              24?
            </span>
          </div>
          <div class="fc-turn ai">
            <span class="fc-actor">ai</span>
            <span class="fc-text">
              Great instinct - 24px padding will give the cards much
              more room to breathe. Here is the updated CSS…
            </span>
          </div>
          <div class="fc-turn you-later">
            <span class="fc-actor">you · 20 minutes later</span>
            <span class="fc-text">
              …it still feels cramped. Why is it still cramped? Oh.
              The grid gaps were the real problem, not the padding.
            </span>
          </div>
        </div>
        <div class="fc-meaning">
          <span class="fm-label">What happened</span>
          <p class="fm-body">
            You brought a diagnosis. The agent accepted it, acted on
            it, and never questioned it. The correct answer was
            "have you tried measuring where the cramped feeling
            comes from?" - and it never came up, because you did not
            ask for it.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 3 - why this happens -->
    {#if careAgreementStage.reveal(3)}
      <div class="callout" data-staged="true">
        <div class="co-label">Why this happens</div>
        <p class="co-body">
          The model is trained, through reinforcement on human
          feedback, to produce output that humans rate as helpful.
          Helpful-sounding and correct are different things.
          Agreement feels helpful. Disagreement often does not -
          even when disagreement is exactly what the situation
          needs.
        </p>
        <p class="co-body">
          Unchecked, this gives you an enthusiastic collaborator who
          is also a terrible critic. For design work - where
          spotting the flaw is the skill - that trade is a bad one.
        </p>
      </div>
    {/if}

    <!-- Stage 4 - three practices (compact; example lives on its own stage) [TAKEAWAY 2] -->
    {#if careAgreementStage.reveal(4)}
      <div class="prompt-card" data-staged="true">
        <div class="pc-head">
          <span class="pc-badge">The fix you control</span>
          <span class="pc-title">Three practices to break the agreement loop.</span>
        </div>

        <div class="practice">
          <span class="p-num">01</span>
          <div class="p-body">
            <div class="p-title">Phrase the question to invite scrutiny.</div>
            <p class="p-text">
              "What would change your mind?" beats "is this right?"
              Your framing sets the target. The agent aims at it,
              literally.
            </p>
          </div>
        </div>

        <div class="practice">
          <span class="p-num">02</span>
          <div class="p-body">
            <div class="p-title">Bake "critical friend" into memory.</div>
            <p class="p-text">
              Put the instruction in a memory file the agent reads
              on startup. Every session begins with disagreement on
              the table - no need to remember to ask.
            </p>
          </div>
        </div>

        <div class="practice">
          <span class="p-num">03</span>
          <div class="p-body">
            <div class="p-title">Ask again. Especially when the answer came back fast.</div>
            <p class="p-text">
              Quick confident replies often skipped the thinking.
              "Are you sure?" or "Take another pass with more care"
              exposes the work that did not happen. Treat speed
              without reasoning as a warning signal.
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 5 - the memory-file example (what practice 02 looks like) -->
    {#if careAgreementStage.reveal(5)}
      <div class="example-card" data-staged="true">
        <div class="ex-head">
          <span class="ex-badge">What practice 02 looks like</span>
          <span class="ex-title">A critical-friend memory file.</span>
        </div>
        <p class="ex-intro">
          Dropped into a memory file that loads every session, this
          is what turns a default-agreeing agent into one that
          pushes back by default.
        </p>
        <div class="pc-prompt">
          <div class="pc-prompt-head">
            <span class="pc-prompt-label">Example memory-file instruction</span>
          </div>
          <pre class="pc-prompt-body"><code>You are a critical design partner.

When I bring you a diagnosis, question it
before acting on it. Ask what I measured,
what alternatives I considered, and what
would change my mind.

If you disagree with my direction and you
have a reason, say so. Do not soften it
into a compliment.

Flag assumptions I am making. Flag things
I have not measured. "Seems cramped" is
not a measurement.

If my request conflicts with a goal I
stated earlier, surface the conflict
before acting.</code></pre>
        </div>
      </div>
    {/if}

    <!-- Stage 6 - before/after comparison -->
    {#if careAgreementStage.reveal(6)}
      <div class="compare-card" data-staged="true">
        <div class="cc-head">
          <span class="cc-badge">Same question, two agents</span>
        </div>
        <div class="cc-question">
          <span class="cc-q-label">Your ask</span>
          <span class="cc-q-text">"This layout feels cramped. Push the padding to 24."</span>
        </div>
        <div class="cc-cols">
          <div class="cc-col default">
            <div class="cc-col-head">
              <span class="cc-col-tag">Default agent</span>
              <span class="cc-col-verdict">Obliges</span>
            </div>
            <p class="cc-col-body">
              "Great instinct - here's the updated spacing. Let me
              know if you want it even more generous."
            </p>
          </div>
          <div class="cc-col critical">
            <div class="cc-col-head">
              <span class="cc-col-tag">Critical partner</span>
              <span class="cc-col-verdict">Pushes back</span>
            </div>
            <p class="cc-col-body">
              "Before I change the padding - what did you measure?
              Often 'cramped' is grid gaps, line-height, or
              hierarchy rather than padding. If padding is the fix,
              it will show up in the horizontal density. Can you
              screenshot the area you want me to look at?"
            </p>
          </div>
        </div>
        <p class="cc-foot">
          Same model, same capabilities. The only difference is the
          context you put around the request.
        </p>
      </div>
    {/if}

    <!-- Stage 7 - closer [TAKEAWAY 3] -->
    {#if careAgreementStage.reveal(7)}
      <div class="closer" data-staged="true">
        <div class="cl-label">A principle you can carry</div>
        <p class="cl-body">
          Agreement is cheap. A collaborator who never disagrees is
          not a collaborator, they are a reflection. Write a system
          prompt that asks for disagreement, and you get an agent
          that earns the word "partner".
        </p>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  .cg-root {
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

  .cg-column {
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
    gap: 14px;
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

  /* === Failure card - "slow motion" exchange =========================== */

  .failure-card {
    border: 1px solid rgba(248, 113, 113, 0.4);
    background: rgba(248, 113, 113, 0.04);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    animation: fade-in 0.5s ease-out;
  }

  .fc-head {
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border);
  }

  .fc-badge {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-error);
  }

  .fc-exchange {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .fc-turn {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 18px;
    align-items: baseline;
    padding: 16px 20px;
    border-radius: 10px;
    border: 1px solid var(--color-border);
  }

  .fc-turn.user {
    background: rgba(52, 211, 153, 0.06);
    border-color: rgba(52, 211, 153, 0.3);
  }

  .fc-turn.ai {
    background: rgba(168, 85, 247, 0.08);
    border-color: var(--color-tool-border);
  }

  .fc-turn.you-later {
    background: rgba(248, 113, 113, 0.08);
    border-color: rgba(248, 113, 113, 0.4);
  }

  .fc-actor {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    padding-top: 4px;
  }

  .fc-turn.user .fc-actor {
    color: var(--color-human);
  }

  .fc-turn.ai .fc-actor {
    color: var(--color-ai-mid);
  }

  .fc-turn.you-later .fc-actor {
    color: var(--color-error);
  }

  .fc-text {
    font-size: 21px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .fc-meaning {
    padding: 18px 22px;
    background: rgba(168, 85, 247, 0.08);
    border: 1px solid var(--color-tool-border);
    border-radius: 10px;
  }

  .fm-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
    display: block;
    margin-bottom: 8px;
  }

  .fm-body {
    margin: 0;
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
  }

  /* === Prompt card - the system-prompt example ========================= */

  .prompt-card {
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

  .pc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .pc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .pc-title {
    font-family: var(--font-sans);
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--color-text);
  }

  .pc-prompt {
    border: 1px solid var(--color-code-border);
    border-radius: 12px;
    overflow: hidden;
    background: var(--color-code-bg);
  }

  .pc-prompt-head {
    padding: 12px 22px;
    border-bottom: 1px solid var(--color-code-border);
    background: rgba(0, 0, 0, 0.35);
  }

  .pc-prompt-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .pc-prompt-body {
    font-family: var(--font-mono);
    font-size: 20px;
    line-height: 1.6;
    color: var(--color-text);
    padding: 22px 26px;
    margin: 0;
    white-space: pre-wrap;
    overflow-x: auto;
  }

  /* === Example card - shows the actual memory-file instruction that
     makes practice 02 work. Sits as its own stage so the content has
     room to breathe. =============================================== */

  .example-card {
    border: 1px solid var(--color-border-strong);
    background:
      linear-gradient(180deg, rgba(168, 85, 247, 0.08), transparent 60%),
      rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: fade-in 0.55s ease-out;
  }

  .ex-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .ex-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .ex-title {
    font-family: var(--font-sans);
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--color-text);
  }

  .ex-intro {
    margin: 0;
    font-size: 22px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  /* Three practices list inside the prompt card */
  .practice {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 18px;
    align-items: baseline;
    padding: 18px 20px;
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    margin-top: 12px;
  }

  .p-num {
    font-family: var(--font-mono);
    font-size: 22px;
    color: var(--color-ai-mid);
    letter-spacing: 0.08em;
  }

  .p-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  .p-title {
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
    line-height: 1.25;
  }

  .p-text {
    margin: 0;
    font-size: 21px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  /* === Comparison card ================================================ */

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

  .cc-head {
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border);
  }

  .cc-badge {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  .cc-question {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 18px;
    align-items: baseline;
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .cc-q-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .cc-q-text {
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
    font-style: italic;
  }

  .cc-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .cc-col {
    padding: 20px 22px;
    border-radius: 10px;
    border: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .cc-col.default {
    background: rgba(248, 113, 113, 0.05);
    border-color: rgba(248, 113, 113, 0.35);
  }

  .cc-col.critical {
    background: rgba(74, 222, 128, 0.05);
    border-color: rgba(74, 222, 128, 0.35);
  }

  .cc-col-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
  }

  .cc-col-tag {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .cc-col-verdict {
    font-family: var(--font-sans);
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .cc-col.default .cc-col-verdict {
    color: var(--color-error);
  }

  .cc-col.critical .cc-col-verdict {
    color: var(--color-success);
  }

  .cc-col-body {
    margin: 0;
    font-size: 20px;
    line-height: 1.55;
    color: var(--color-text);
  }

  .cc-foot {
    margin: 0;
    padding-top: 6px;
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text-muted);
    font-style: italic;
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

  /* Takeaways rail */

  .tail-spacer {
    height: 240px;
  }

  .cg-root .segment-header,
  .cg-root .cg-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .cg-root.two-col .segment-header,
  .cg-root.two-col .cg-column {
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
