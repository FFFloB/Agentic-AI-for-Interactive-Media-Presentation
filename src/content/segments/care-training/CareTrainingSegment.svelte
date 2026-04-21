<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { careTrainingStage } from './stage.svelte';

  let { segmentId = 'care-training' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, careTrainingStage));
  onDestroy(() => unregisterStage(segmentId));

  // === Takeaways rail ==================================================

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  // Draft copy; hand-authored by the presenter before the talk.
  const takeaways = [
    { at: 3, text: 'In the UK, commercial training on someone else\'s work still needs a licence. Section 29A only covers non-commercial research.' },
    { at: 6, text: 'Using a paid AI tool is different from training one. The safety net exists only on Business and Enterprise tiers, and never for trademark claims.' },
    { at: 8, text: 'The big UK question is not settled. Getty v Stability AI did not decide whether training itself is lawful.' },
  ];
  const takeawaysActive = $derived(careTrainingStage.reveal(takeaways[0].at));

  // Auto-scroll
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
    const _ = careTrainingStage.stageIndex;
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

  // Indemnity table rows. Compact, designer-friendly, no legalese.
  const indemnityRows = [
    {
      tier: 'Free consumer',
      examples: 'ChatGPT free, Claude free, Gemini free',
      cover: 'None',
      tone: 'bad' as const,
    },
    {
      tier: 'Paid consumer',
      examples: 'ChatGPT Plus, Claude Pro, Copilot Pro',
      cover: 'None or limited',
      tone: 'bad' as const,
    },
    {
      tier: 'Team / Business',
      examples: 'ChatGPT Team, Microsoft 365 Copilot',
      cover: 'Yes, with carve-outs',
      tone: 'ok' as const,
    },
    {
      tier: 'Enterprise / API',
      examples: 'ChatGPT Enterprise, Claude for Work, Azure OpenAI, Vertex AI',
      cover: 'Broadest - capped (12mo fees) or uncapped',
      tone: 'good' as const,
    },
  ];
</script>

<div
  class="ct-root"
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
        <li class="takeaway" class:shown={careTrainingStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Legal · Training data</span>
    <h1 class="headline-gradient">What went in</h1>
    <p class="subhead">
      Where the model's knowledge came from, and whether you can safely
      ship what it makes. A plain-language tour of UK law, live court
      cases, and what your paid subscription actually promises.
    </p>
  </header>

  <div class="ct-column">
    <!-- Stage 1 - framing -->
    {#if careTrainingStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          Where did the model's knowledge come from, and does that
          matter for what I ship?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - training corpora reality -->
    {#if careTrainingStage.reveal(2)}
      <div class="callout" data-staged="true">
        <div class="co-label">The short answer</div>
        <p class="co-body">
          Most models were trained on mixed corpora: some licensed, a
          lot scraped. Consent from the original authors was usually
          not obtained. If the model can render something
          <em>"in the style of"</em> a specific artist - that style
          came from somewhere.
        </p>
      </div>
    {/if}

    <!-- Stage 3 - UK law source card [TAKEAWAY 1] -->
    {#if careTrainingStage.reveal(3)}
      <div class="source-card" data-staged="true">
        <div class="sc-head">
          <span class="sc-badge">UK law</span>
          <span class="sc-citation">Copyright, Designs and Patents Act 1988, s.29A</span>
        </div>
        <div class="sc-title">Research only. Non-commercial.</div>
        <p class="sc-body">
          The only UK exception that lets you train on other people's
          copyrighted material covers computational analysis for
          non-commercial research, with a sufficient acknowledgement,
          and only if you accessed the work lawfully.
        </p>
        <div class="sc-meaning">
          <span class="sm-label">What this means</span>
          <p class="sm-body">
            Commercial training - for a client, a startup, a product,
            a portfolio piece you intend to sell - needs a licence.
            You cannot scrape a dataset together and train on it for
            work. The government consulted on loosening this in
            December 2024 and stepped back from legislating in its
            March 2026 report. The rule stands.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 4 - Getty v Stability AI -->
    {#if careTrainingStage.reveal(4)}
      <div class="source-card" data-staged="true">
        <div class="sc-head">
          <span class="sc-badge">Case law</span>
          <span class="sc-citation">Getty Images v Stability AI [2025] EWHC 2863 (Ch)</span>
        </div>
        <div class="sc-title">The UK did not decide the big question.</div>
        <div class="sc-split">
          <div class="sc-col">
            <div class="sc-col-label decided">What it decided</div>
            <ul>
              <li>Model weights are not themselves an "infringing copy".</li>
              <li>Narrow trademark win for Getty on watermark reproduction.</li>
            </ul>
          </div>
          <div class="sc-col">
            <div class="sc-col-label open">What it didn't decide</div>
            <ul>
              <li>Whether the act of training on copyrighted work in the UK is lawful.</li>
              <li>Training happened on US servers, so the UK could not reach it.</li>
              <li>Getty's appeal is live.</li>
            </ul>
          </div>
        </div>
        <div class="sc-meaning">
          <span class="sm-label">What this means</span>
          <p class="sm-body">
            Do not treat this ruling as "AI companies won". The
            question an MA Digital Design student actually cares
            about - can a model legally train on my and my peers'
            work - is still open in the UK.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 5 - Transition: using vs training -->
    {#if careTrainingStage.reveal(5)}
      <div class="callout accent" data-staged="true">
        <div class="co-label">Two different questions</div>
        <p class="co-body">
          <strong>Using</strong> ChatGPT, Claude, Gemini, Firefly on
          your own work is a different question from
          <strong>training</strong> a model. The first is generally
          fine under UK law today. The risk on the output side is
          managed through the vendor's indemnity - which only exists
          on paid business and enterprise plans.
        </p>
      </div>
    {/if}

    <!-- Stage 6 - indemnity table [TAKEAWAY 2] -->
    {#if careTrainingStage.reveal(6)}
      <div class="indemnity-card" data-staged="true">
        <div class="ic-head">
          <span class="ic-badge">Vendor terms</span>
          <span class="ic-title">What your subscription actually covers</span>
        </div>
        <div class="ic-rows">
          {#each indemnityRows as row, i (row.tier)}
            <div class="ic-row" data-tone={row.tone} style:--i={i}>
              <div class="ic-tier">{row.tier}</div>
              <div class="ic-examples">{row.examples}</div>
              <div class="ic-cover">{row.cover}</div>
            </div>
          {/each}
        </div>
        <div class="ic-notes">
          <div class="ic-note">
            <span class="ic-note-label">Carve-outs everyone has</span>
            <span class="ic-note-body">
              You didn't disable safety features. You had rights to
              your input. You didn't knowingly use infringing output.
              Trademark claims are excluded across the board.
            </span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 7 - Adobe Firefly note -->
    {#if careTrainingStage.reveal(7)}
      <div class="source-card" data-staged="true">
        <div class="sc-head">
          <span class="sc-badge design">Design note</span>
          <span class="sc-citation">Adobe Firefly enterprise</span>
        </div>
        <div class="sc-title">The one trained on licensed data by design.</div>
        <p class="sc-body">
          Adobe positions Firefly as trained on licensed Adobe Stock,
          openly licensed material, and public domain work. The
          enterprise indemnity covers the specific Firefly output -
          not anything you combine with it or any beta-labelled
          feature.
        </p>
        <div class="sc-meaning">
          <span class="sm-label">What this means</span>
          <p class="sm-body">
            For image work where commercial cleanliness matters more
            than cutting-edge capability, Firefly is the lowest-risk
            path available. For anything else, you are reading an
            indemnity clause and deciding whether to trust it.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 8 - closer [TAKEAWAY 3] -->
    {#if careTrainingStage.reveal(8)}
      <div class="closer" data-staged="true">
        <div class="cl-label">Rules of thumb you can use tomorrow</div>
        <ol class="cl-rules">
          <li>Training on other people's work needs a licence. Don't do it for client work.</li>
          <li>Using paid tools on your own work is fine. Check you're on a plan with an indemnity if the work is commercial.</li>
          <li>For commercial image work, Firefly is the least fraught. For everything else, read the clause before you ship.</li>
          <li>Tell collaborators when AI touched the work. IPA / ISBA Principle 11 already makes this the UK advertising norm.</li>
        </ol>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  /* === Shared layout - same pattern as chat/LLM/CE/uses segments. ===== */

  .ct-root {
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

  .ct-column {
    width: min(880px, 100%);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  /* === Messages + callouts (reused) =================================== */

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
    color: var(--color-text-subtle);
  }
  .callout.accent .co-label {
    color: var(--color-ai-mid);
  }
  .co-body {
    margin: 0;
    font-size: 25px;
    line-height: 1.5;
    color: var(--color-text);
  }
  .co-body em {
    font-style: italic;
    color: var(--color-ai-mid);
  }
  .co-body strong {
    color: var(--color-ai-mid);
    font-weight: 600;
  }

  /* === Source card - the distinctive primitive for this segment.
     Two zones: a citation (what the law or case actually is) and a
     "what this means" panel (plain-language translation). ============= */

  .source-card {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: fade-in 0.5s ease-out;
  }

  .sc-head {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .sc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .sc-badge.design {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(168, 85, 247, 0.8));
  }

  .sc-citation {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--color-text);
    letter-spacing: 0.02em;
  }

  .sc-title {
    font-family: var(--font-sans);
    font-size: 30px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--color-text);
  }

  .sc-body {
    margin: 0;
    font-size: 22px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  /* Two-column split for Getty "what was / wasn't decided" */
  .sc-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .sc-col {
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .sc-col-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .sc-col-label.decided {
    color: var(--color-success);
  }
  .sc-col-label.open {
    color: var(--color-ai-end);
  }

  .sc-col ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sc-col li {
    font-size: 19px;
    line-height: 1.5;
    color: var(--color-text);
    padding-left: 18px;
    position: relative;
  }

  .sc-col li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.65em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-text-subtle);
  }

  .sc-col-label.decided + ul li::before {
    background: var(--color-success);
  }
  .sc-col-label.open + ul li::before {
    background: var(--color-ai-end);
  }

  /* "What this means" — plain-language translation panel, visually
     distinct from the legal content above it. */
  .sc-meaning {
    background: rgba(168, 85, 247, 0.08);
    border: 1px solid var(--color-tool-border);
    border-radius: 10px;
    padding: 18px 22px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sm-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  .sm-body {
    margin: 0;
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
  }

  /* === Indemnity table card ========================================== */

  .indemnity-card {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 24px 28px;
    animation: fade-in 0.5s ease-out;
  }

  .ic-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    margin-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .ic-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .ic-title {
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  .ic-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ic-row {
    display: grid;
    grid-template-columns: 220px 1fr 260px;
    gap: 18px;
    padding: 14px 18px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    align-items: center;
    opacity: 0;
    transform: translateY(8px);
    animation: row-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(var(--i) * 0.1s);
  }

  .ic-row[data-tone='bad'] {
    border-left: 3px solid rgba(248, 113, 113, 0.55);
  }
  .ic-row[data-tone='ok'] {
    border-left: 3px solid rgba(245, 158, 11, 0.55);
  }
  .ic-row[data-tone='good'] {
    border-left: 3px solid rgba(74, 222, 128, 0.55);
  }

  .ic-tier {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--color-text);
    letter-spacing: 0.02em;
  }

  .ic-examples {
    font-family: var(--font-mono);
    font-size: 16px;
    line-height: 1.4;
    color: var(--color-text-subtle);
  }

  .ic-cover {
    font-family: var(--font-mono);
    font-size: 17px;
    color: var(--color-text);
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .ic-row[data-tone='bad'] .ic-cover {
    color: var(--color-error);
  }
  .ic-row[data-tone='good'] .ic-cover {
    color: var(--color-success);
  }

  .ic-notes {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--color-border);
  }

  .ic-note {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 18px;
    align-items: baseline;
    font-size: 19px;
    line-height: 1.5;
  }

  .ic-note-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .ic-note-body {
    color: var(--color-text-muted);
  }

  /* === Closer ======================================================= */

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
    margin-bottom: 18px;
  }

  .cl-rules {
    list-style: decimal;
    padding-left: 30px;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .cl-rules li {
    font-size: 23px;
    line-height: 1.5;
    color: var(--color-text);
    padding-left: 6px;
  }

  .cl-rules li::marker {
    color: var(--color-ai-mid);
    font-family: var(--font-mono);
    font-weight: 600;
  }

  /* === Takeaways rail ================================================ */

  .tail-spacer {
    height: 240px;
  }

  .ct-root .segment-header,
  .ct-root .ct-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .ct-root.two-col .segment-header,
  .ct-root.two-col .ct-column {
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

  @keyframes row-in {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
