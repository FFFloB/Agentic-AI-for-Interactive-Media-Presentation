<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { careAttributionStage } from './stage.svelte';

  let { segmentId = 'care-attribution' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, careAttributionStage));
  onDestroy(() => unregisterStage(segmentId));

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    { at: 3, text: 'Declaring AI use is the default at York and across UK higher education. Vague declarations read as hiding.' },
    { at: 5, text: 'Name your collaborators. Describe their role, describe what you did. A case study of process beats a glossy output.' },
    { at: 7, text: 'Session logs are a cheap, durable way to keep your practice honest. Start one for every project.' },
  ];
  const takeawaysActive = $derived(careAttributionStage.reveal(takeaways[0].at));

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
    const _ = careAttributionStage.stageIndex;
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

  // Placeholder audit-log excerpt. Real session-log rendering is a
  // future implementation; for now this illustrates the pattern
  // convincingly enough for a live demo beat.
  const sessionExcerpt = [
    { time: '14:32', actor: 'you', text: 'Design segment 5: "From prompt to context". Key: the chart is pinned, scroll content is left.' },
    { time: '14:34', actor: 'ai', text: 'Drafted 25-stage scroll + pinned chart; bubbles build, callouts punctuate, takeaways land at the end.' },
    { time: '14:48', actor: 'you', text: 'Templated exemplars only, headlines stay hand-authored.' },
    { time: '14:51', actor: 'ai', text: 'Split content into technical / design variants; thread "Plate" through bubbles + dialog sample.' },
    { time: '15:07', actor: 'you', text: 'Gentler language in the warn callouts. Keep "you own what ships" rule.' },
  ];
</script>

<div
  class="ca-root"
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
        <li class="takeaway" class:shown={careAttributionStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Ethical · Attribution</span>
    <h1 class="headline-gradient">Name your collaborators</h1>
    <p class="subhead">
      Declaring AI use is already the default, at York and across UK
      creative industry. The admission is the easy part. The discovery
      is what gets you.
    </p>
  </header>

  <div class="ca-column">
    <!-- Stage 1 - framing -->
    {#if careAttributionStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          Do I have to say I used it?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - the short answer -->
    {#if careAttributionStage.reveal(2)}
      <div class="callout accent" data-staged="true">
        <div class="co-label">The short answer</div>
        <p class="co-body">
          Yes. And it is already expected, not optional. The Russell
          Group, QAA and Jisc all converge on the same position -
          declare, describe, do it by default. The only question is
          whether you frame it as hiding or as process.
        </p>
      </div>
    {/if}

    <!-- Stage 3 - York specifically [TAKEAWAY 1] -->
    {#if careAttributionStage.reveal(3)}
      <div class="source-card" data-staged="true">
        <div class="sc-head">
          <span class="sc-badge">University policy</span>
          <span class="sc-citation">University of York - Acceptable Assistance with Assessments (2023/24, carried forward)</span>
        </div>
        <div class="sc-title">Declare by default. Module briefs override.</div>
        <p class="sc-body">
          For any assessed work at York, declare your AI use unless
          the module brief tells you otherwise. The declaration is
          expected to name the tool, say what you used it for, and
          describe the extent.
        </p>
        <div class="sc-meaning">
          <span class="sm-label">What a good declaration looks like</span>
          <div class="sm-examples">
            <div class="sm-ex good">
              <span class="sm-ex-tag">specific</span>
              <span class="sm-ex-text">"Used Gemini to brainstorm three title concepts, picked one, rewrote in my own words."</span>
            </div>
            <div class="sm-ex bad">
              <span class="sm-ex-tag">vague</span>
              <span class="sm-ex-text">"Used AI for ideas."</span>
            </div>
          </div>
          <p class="sm-note">
            York recommends <strong>Google Gemini via your university credentials</strong>. It has a data-protection arrangement that keeps inputs out of training and human review. Never put personal, sensitive, or third-party copyrighted material into public tools.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 4 - D&AD 2026 -->
    {#if careAttributionStage.reveal(4)}
      <div class="source-card" data-staged="true">
        <div class="sc-head">
          <span class="sc-badge design">Industry benchmark</span>
          <span class="sc-citation">D&amp;AD Awards 2026 - Entry Kit</span>
        </div>
        <div class="sc-title">Structured disclosure, at the point of entry.</div>
        <p class="sc-body">
          D&amp;AD 2026 requires a structured declaration of AI
          involvement for every entry, across every category. It
          covers not just the final output but all supporting
          materials - case films, process documents, stills.
        </p>
        <div class="dad-rules">
          <div class="dr-row">
            <span class="dr-num">01</span>
            <span class="dr-body">Disclose AI involvement at entry, in the required structured format.</span>
          </div>
          <div class="dr-row">
            <span class="dr-num">02</span>
            <span class="dr-body">Sign an Entry Validation Card. A named human is responsible for the work.</span>
          </div>
          <div class="dr-row">
            <span class="dr-num">03</span>
            <span class="dr-body">AI work is eligible. There is no blanket ban. You just cannot hide it.</span>
          </div>
        </div>
        <div class="sc-meaning">
          <span class="sm-label">What this means</span>
          <p class="sm-body-p">
            This is the current UK industry benchmark. What D&amp;AD
            requires, any serious portfolio review or client
            relationship will expect. Build the habit before you
            need it.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 5 - named collaborator framing [TAKEAWAY 2] -->
    {#if careAttributionStage.reveal(5)}
      <div class="frame-card" data-staged="true">
        <div class="fr-head">
          <span class="fr-badge">The frame that works</span>
        </div>
        <div class="fr-quote">Treat the agent as a named collaborator, not a ghost.</div>
        <div class="fr-body">
          <div class="fr-col">
            <div class="fr-col-label">List the tools</div>
            <p>Gemini. Midjourney. Runway. Claude. Name them. The audience knows them anyway.</p>
          </div>
          <div class="fr-col">
            <div class="fr-col-label">Describe their role</div>
            <p>Ideation, asset generation, copywriting, motion, upscaling. What did it actually do?</p>
          </div>
          <div class="fr-col">
            <div class="fr-col-label">Describe your role</div>
            <p>Concept. Selection. Iteration. Composition. Final edit. What did you decide?</p>
          </div>
        </div>
        <div class="fr-foot">
          A transparent AI-assisted case study reads more credibly
          than a polished AI output pretending to be hand-made.
          Hiring panels notice the difference.
        </div>
      </div>
    {/if}

    <!-- Stage 6 - IPA/ISBA Principle 11 -->
    {#if careAttributionStage.reveal(6)}
      <div class="source-card" data-staged="true">
        <div class="sc-head">
          <span class="sc-badge">Industry norm</span>
          <span class="sc-citation">IPA / ISBA 12 Principles for Generative AI in Advertising, Principle 11 (2023, updated March 2025)</span>
        </div>
        <div class="sc-title">Tell the other side.</div>
        <p class="sc-body">
          Neither an agency nor an advertiser should include
          AI-generated content in materials handed to the other
          without the other's agreement. Applies to students the
          moment they start freelancing.
        </p>
        <div class="sc-meaning">
          <span class="sm-label">What this means</span>
          <p class="sm-body-p">
            The closest thing UK creative industry has to a
            disclosure norm is already specific: do not quietly
            pass AI output across a client / partner line. Say so
            before you send it.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 7 - live audit-log demo [TAKEAWAY 3] -->
    {#if careAttributionStage.reveal(7)}
      <div class="session-card" data-staged="true">
        <div class="ss-head">
          <span class="ss-badge">Live demonstration</span>
          <span class="ss-title">How this very talk was built.</span>
        </div>
        <div class="ss-intro">
          <p>
            An excerpt from this presentation's own session audit,
            shown live. Every contribution to every segment is
            logged, with AI turns marked and human decisions
            preserved. Not a trust exercise, a paper trail.
          </p>
        </div>
        <div class="ss-log">
          {#each sessionExcerpt as row, i (i)}
            <div class="ss-row" data-actor={row.actor} style:--i={i}>
              <span class="ss-time">{row.time}</span>
              <span class="ss-actor">{row.actor === 'ai' ? 'ai' : 'you'}</span>
              <span class="ss-text">{row.text}</span>
            </div>
          {/each}
          <div class="ss-ellipsis">+ 340 more entries across 18 sessions</div>
        </div>
        <div class="sc-meaning">
          <span class="sm-label">Why this pattern</span>
          <p class="sm-body-p">
            Lightweight. Human-readable. Preserves decisions as
            well as edits. If someone asks three months from now
            <em>"why does this segment say what it says?"</em> -
            you can point to the line that decided it.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 8 - closer -->
    {#if careAttributionStage.reveal(8)}
      <div class="closer" data-staged="true">
        <div class="cl-label">The rule underneath all of it</div>
        <p class="cl-body">
          Transparency beats concealment in every scenario you will
          ever encounter. The admission is the easy part. The
          discovery is what gets you. Get good at naming your
          collaborators now, while the stakes are a coursework mark
          - so you are already good at it when the stakes are a job.
        </p>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  /* Shared layout identical to the other care segments. */

  .ca-root {
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

  .ca-column {
    width: min(880px, 100%);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  /* Messages + callouts */

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

  /* === Source card - reused pattern ================================= */

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

  .source-card .sc-head {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .source-card .sc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .source-card .sc-badge.design {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(168, 85, 247, 0.8));
  }

  .source-card .sc-citation {
    font-family: var(--font-mono);
    font-size: 16px;
    color: var(--color-text);
    letter-spacing: 0.02em;
    line-height: 1.4;
  }

  .source-card .sc-title {
    font-family: var(--font-sans);
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--color-text);
  }

  .source-card .sc-body {
    margin: 0;
    font-size: 22px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .sc-meaning {
    background: rgba(168, 85, 247, 0.08);
    border: 1px solid var(--color-tool-border);
    border-radius: 10px;
    padding: 18px 22px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sm-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  .sm-body-p {
    margin: 0;
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .sm-body-p em {
    font-style: italic;
    color: var(--color-ai-mid);
  }

  .sm-note {
    margin: 6px 0 0 0;
    font-size: 20px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .sm-note strong {
    color: var(--color-text);
    font-weight: 600;
  }

  /* York declaration examples - good vs vague */
  .sm-examples {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sm-ex {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 14px;
    align-items: baseline;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 20px;
    line-height: 1.5;
  }

  .sm-ex.good {
    background: rgba(74, 222, 128, 0.08);
    border: 1px solid rgba(74, 222, 128, 0.3);
  }

  .sm-ex.bad {
    background: rgba(248, 113, 113, 0.06);
    border: 1px solid rgba(248, 113, 113, 0.3);
  }

  .sm-ex-tag {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .sm-ex.good .sm-ex-tag {
    color: var(--color-success);
  }

  .sm-ex.bad .sm-ex-tag {
    color: var(--color-error);
  }

  .sm-ex-text {
    color: var(--color-text);
  }

  /* D&AD rules list */
  .dad-rules {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .dr-row {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 18px;
    align-items: baseline;
    padding: 14px 18px;
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }

  .dr-num {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--color-ai-mid);
    letter-spacing: 0.08em;
  }

  .dr-body {
    font-size: 20px;
    line-height: 1.5;
    color: var(--color-text);
  }

  /* === Frame card - named collaborator pattern ===================== */

  .frame-card {
    border: 1px solid var(--color-tool-border);
    background:
      linear-gradient(180deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.04)),
      rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-lg);
    padding: 30px 34px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    animation: fade-in 0.55s ease-out;
    box-shadow: 0 24px 64px -24px rgba(236, 72, 153, 0.3);
  }

  .fr-head {
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-border);
  }

  .fr-badge {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  .fr-quote {
    font-family: var(--font-sans);
    font-size: 34px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    background: var(--gradient-headline);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .fr-body {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .fr-col {
    padding: 18px 20px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .fr-col-label {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
    margin-bottom: 10px;
  }

  .fr-col p {
    margin: 0;
    font-size: 19px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .fr-foot {
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text-muted);
    padding-top: 10px;
    border-top: 1px solid var(--color-border);
  }

  /* === Session card - live audit-log demo ========================== */

  .session-card {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: fade-in 0.55s ease-out;
  }

  .ss-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .ss-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .ss-title {
    font-family: var(--font-sans);
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  .ss-intro p {
    margin: 0;
    font-size: 22px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .ss-log {
    background: var(--color-code-bg);
    border: 1px solid var(--color-code-border);
    border-radius: 10px;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ss-row {
    display: grid;
    grid-template-columns: 72px 64px 1fr;
    gap: 18px;
    align-items: baseline;
    padding: 10px 0;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
    opacity: 0;
    transform: translateX(6px);
    animation: row-in 0.4s ease-out forwards;
    animation-delay: calc(var(--i) * 0.08s);
  }

  .ss-row:last-of-type {
    border-bottom: none;
  }

  .ss-time {
    font-family: var(--font-mono);
    font-size: 15px;
    color: var(--color-text-subtle);
    letter-spacing: 0.04em;
  }

  .ss-actor {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 9999px;
    text-align: center;
    align-self: start;
    margin-top: 2px;
  }

  .ss-row[data-actor='you'] .ss-actor {
    background: rgba(52, 211, 153, 0.15);
    color: var(--color-human);
    border: 1px solid rgba(52, 211, 153, 0.3);
  }

  .ss-row[data-actor='ai'] .ss-actor {
    background: rgba(236, 72, 153, 0.15);
    color: var(--color-ai-mid);
    border: 1px solid rgba(236, 72, 153, 0.3);
  }

  .ss-text {
    font-family: var(--font-mono);
    font-size: 18px;
    line-height: 1.55;
    color: var(--color-text);
  }

  .ss-ellipsis {
    font-family: var(--font-mono);
    font-size: 15px;
    color: var(--color-text-subtle);
    padding-top: 6px;
    letter-spacing: 0.04em;
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

  /* Takeaways rail + column shift (reused). */

  .tail-spacer {
    height: 240px;
  }

  .ca-root .segment-header,
  .ca-root .ca-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .ca-root.two-col .segment-header,
  .ca-root.two-col .ca-column {
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
      transform: translateX(0);
    }
  }
</style>
