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

  const takeaways = [
    { at: 2, text: 'The tools were trained mostly on unlicensed material. The law has not settled it. Using them responsibly is now your job.' },
    { at: 4, text: 'Using AI on your own work is the ordinary case. The grey areas are style mimicry and reusing someone else\'s material.' },
    { at: 6, text: 'A paid tier with indemnity is what protects commercial work. Read the carve-outs - trademarks are never covered.' },
    { at: 7, text: 'You do not need to be a legal expert. Use AI itself to read the terms and follow how the law is changing.' },
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

  // Indemnity table rows. Provider-agnostic descriptions; the question
  // the table answers is "will the vendor defend me if the output gets
  // sued?" - plain yes/no answers.
  const indemnityRows = [
    {
      tier: 'Free consumer',
      examples: 'Free web chatbots and image generators',
      cover: 'No - you are on your own',
      tone: 'bad' as const,
    },
    {
      tier: 'Paid consumer',
      examples: 'Personal paid plans',
      cover: 'No, or barely',
      tone: 'bad' as const,
    },
    {
      tier: 'Team / Business',
      examples: 'Team or business subscriptions',
      cover: 'Yes - they will defend you, with conditions',
      tone: 'ok' as const,
    },
    {
      tier: 'Enterprise / API',
      examples: 'Enterprise plans or direct API access',
      cover: 'Yes - broadest cover, sometimes uncapped',
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
    <span class="eyebrow">Legal · Copyright</span>
    <h1 class="headline-gradient">Copyright</h1>
    <p class="subhead">
      If you use AI tools to make design work, are you stealing someone
      else's copyright? Mostly no - as long as you stay out of a few
      clearly marked traps. Here is what to watch for, and how the
      paid-tool indemnity protects you when you cannot.
    </p>
  </header>

  <div class="ct-column">
    <!-- Stage 1 - framing -->
    {#if careTrainingStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          If I use AI tools to make my design work, am I stealing
          someone else's work?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - where the tools came from + the 'stealing' debate [TAKEAWAY 1] -->
    {#if careTrainingStage.reveal(2)}
      <div class="origin-card" data-staged="true">
        <div class="oc-head">
          <span class="oc-badge">Where this came from</span>
          <span class="oc-title">How the tools got trained, and whether that is "stealing".</span>
        </div>

        <p class="oc-body">
          Models learn by being fed enormous piles of text, images,
          audio, and code - mostly scraped from the open web. The
          model does not store any single piece verbatim, but its
          ability to imitate style, structure, and voice comes
          directly from what went in. In most cases the original
          creators were not asked and were not paid.
        </p>

        <div class="oc-sides">
          <div class="oc-side creators">
            <span class="oc-side-label">Creators say</span>
            <p class="oc-side-body">
              This is copying at a scale no individual would have
              got away with. Attribution and compensation are owed.
              A model that can render "in the style of" an artist
              is a machine trained on that artist.
            </p>
          </div>
          <div class="oc-side makers">
            <span class="oc-side-label">Tool makers say</span>
            <p class="oc-side-body">
              Training is transformative - closer to how an art
              student studies existing work than to photocopying
              it. The model learns patterns, not pieces.
            </p>
          </div>
        </div>

        <div class="oc-consensus">
          <span class="oc-consensus-label">The honest summary</span>
          <p class="oc-consensus-body">
            Courts across several countries are working through
            this; none has settled the core question. The tools
            exist, they are useful, and their training is ethically
            contested and legally unsettled. How you use them - and
            how you credit your sources - is now the part you
            control.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 3 - the basic rule, plain -->
    {#if careTrainingStage.reveal(3)}
      <div class="callout accent" data-staged="true">
        <div class="co-label">The floor</div>
        <p class="co-body">
          Copyright gives a creator control over
          <strong>copies</strong>, <strong>adaptations</strong> and
          <strong>distribution</strong> of their work. To use someone
          else's work you need either their permission - a licence -
          or a legal exception.
        </p>
        <p class="co-body">
          In the UK this sits in the
          <em>Copyright, Designs and Patents Act 1988</em> (CDPA).
          You do not need the specifics. The principle is what
          matters.
        </p>
      </div>
    {/if}

    <!-- Stage 4 - three zones of USE [TAKEAWAY 2] -->
    {#if careTrainingStage.reveal(4)}
      <div class="zones-card" data-staged="true">
        <div class="zc-head">
          <span class="zc-badge">What AI use looks like</span>
          <span class="zc-title">Three zones, three risk levels.</span>
        </div>
        <div class="zone-row" data-tone="good">
          <span class="zone-num">01</span>
          <div class="zone-body">
            <span class="zone-tag">Tool use</span>
            <span class="zone-title">You, with AI as instrument.</span>
            <p class="zone-text">
              You concept, iterate, edit, compose. The AI drafts,
              polishes, fills in boilerplate on work that is yours.
              This is the ordinary case and it is generally fine.
            </p>
          </div>
        </div>
        <div class="zone-row" data-tone="ok">
          <span class="zone-num">02</span>
          <div class="zone-body">
            <span class="zone-tag">Style mimicry</span>
            <span class="zone-title">"In the style of" a named artist.</span>
            <p class="zone-text">
              A legal grey area, and reputationally loaded. Even when
              no specific work is copied, asking for the signature
              style of a living artist - especially for commercial or
              commissioned work - can run into passing-off, unfair
              practices, or advertising-code problems.
            </p>
          </div>
        </div>
        <div class="zone-row" data-tone="pointer">
          <span class="zone-num">03</span>
          <div class="zone-body">
            <span class="zone-tag">Ingestion</span>
            <span class="zone-title">Feeding others' work into the AI.</span>
            <p class="zone-text">
              Uploading someone else's images, video, audio, or
              writing as reference or base material is the ethically
              heaviest case. The ethics section covers this properly
              later - we will not expand on it here.
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 5 - traps to avoid -->
    {#if careTrainingStage.reveal(5)}
      <div class="traps-card" data-staged="true">
        <div class="tc-head">
          <span class="tc-badge">Don'ts</span>
          <span class="tc-title">Three traps to stay out of.</span>
        </div>
        <div class="trap-row">
          <span class="trap-num">01</span>
          <div class="trap-body">
            <span class="trap-title">Do not prompt "in the style of [living named artist]" for commercial work.</span>
            <p class="trap-text">
              The output may not copy any specific piece, but you are
              still courting a passing-off claim, an unfair-practice
              claim, and - if your client or employer finds out - a
              reputational problem that is its own kind of damage.
            </p>
          </div>
        </div>
        <div class="trap-row">
          <span class="trap-num">02</span>
          <div class="trap-body">
            <span class="trap-title">Do not ship output that recognisably reproduces someone else's work.</span>
            <p class="trap-text">
              A logo, a character, an iconic composition - if the AI
              offers it and you ship it, you pressed the button. The
              tool is not the author; you are.
            </p>
          </div>
        </div>
        <div class="trap-row">
          <span class="trap-num">03</span>
          <div class="trap-body">
            <span class="trap-title">Trademarks are separate. They are never covered by vendor indemnity.</span>
            <p class="trap-text">
              Brand names, franchise characters, product names - the
              AI rendering them does not make them available. Every
              indemnity clause carves trademark claims out.
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 6 - indemnity table [TAKEAWAY 3] -->
    {#if careTrainingStage.reveal(6)}
      <div class="indemnity-card" data-staged="true">
        <div class="ic-head">
          <span class="ic-badge">Vendor indemnity</span>
          <span class="ic-title">If someone sues over what you generated, who defends you?</span>
        </div>
        <p class="ic-intro">
          When AI output accidentally reproduces something it
          should not - a logo, a passage, a character, a chunk of
          code - the rights-holder can sue you, the person who
          shipped it. An <strong>indemnity</strong> is the
          vendor's promise to step in and defend you if that
          happens. Whether you get one depends entirely on the
          plan tier you are on.
        </p>
        <div class="ic-rows">
          <div class="ic-row ic-header">
            <div class="ic-tier">Plan tier</div>
            <div class="ic-examples">Typical examples</div>
            <div class="ic-cover">Will they defend you?</div>
          </div>
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
              Even when you are covered: you must not have disabled
              safety features, you must have had rights to your
              input, and you must not have knowingly used
              infringing output. Trademark claims are excluded
              across the board.
            </span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 7 - closer with practical takeaways [TAKEAWAY 4] -->
    {#if careTrainingStage.reveal(7)}
      <div class="closer" data-staged="true">
        <div class="cl-label">Practices you can use tomorrow</div>
        <ol class="cl-rules">
          <li>
            <strong>Review the tools before you commit</strong>. How
            they train, what values they stand for, how they treat
            copyright explicitly. It is in the vendor's docs - half
            an hour pays for itself.
          </li>
          <li>
            <strong>Stay current with the law</strong>. It is moving
            fast. You do not need a legal degree - have an AI read
            terms of use, licence agreements, and court rulings for
            you and summarise them in plain English.
          </li>
          <li>
            <strong>For commercial work, use a paid tier with real
            indemnity</strong>. Always read the carve-outs;
            trademarks are never covered.
          </li>
          <li>
            <strong>For sensitive commercial image work, lean toward
            tools trained on explicitly licensed data</strong>. You
            inherit fewer invisible risks from the training corpus.
          </li>
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

  /* === Origin card (how training works + the "stealing" debate) ===== */

  .origin-card {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: fade-in 0.5s ease-out;
  }

  .oc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .oc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .oc-title {
    font-family: var(--font-sans);
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.25;
    color: var(--color-text);
  }

  .oc-body {
    margin: 0;
    font-size: 22px;
    line-height: 1.55;
    color: var(--color-text);
  }

  .oc-sides {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .oc-side {
    padding: 18px 22px;
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .oc-side.creators {
    border-left: 3px solid rgba(248, 113, 113, 0.55);
    background: rgba(248, 113, 113, 0.04);
  }

  .oc-side.makers {
    border-left: 3px solid rgba(59, 130, 246, 0.55);
    background: rgba(59, 130, 246, 0.04);
  }

  .oc-side-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .oc-side.creators .oc-side-label {
    color: rgba(248, 113, 113, 1);
  }

  .oc-side.makers .oc-side-label {
    color: rgba(96, 165, 250, 1);
  }

  .oc-side-body {
    margin: 0;
    font-size: 20px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .oc-consensus {
    padding: 18px 22px;
    background: rgba(168, 85, 247, 0.08);
    border: 1px solid var(--color-tool-border);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .oc-consensus-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  .oc-consensus-body {
    margin: 0;
    font-size: 21px;
    line-height: 1.5;
    color: var(--color-text);
  }

  /* === Zones card + Traps card (same visual family) ================== */

  .zones-card,
  .traps-card {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: fade-in 0.5s ease-out;
  }

  .zc-head,
  .tc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .zc-badge,
  .tc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .tc-badge {
    background: linear-gradient(135deg, rgba(248, 113, 113, 0.85), rgba(245, 158, 11, 0.85));
  }

  .zc-title,
  .tc-title {
    font-family: var(--font-sans);
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  .zone-row,
  .trap-row {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 18px;
    align-items: baseline;
    padding: 18px 22px;
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .zone-row[data-tone='good'] {
    border-left: 3px solid rgba(74, 222, 128, 0.6);
  }
  .zone-row[data-tone='ok'] {
    border-left: 3px solid rgba(245, 158, 11, 0.6);
  }
  .zone-row[data-tone='pointer'] {
    border-left: 3px solid var(--color-tool-border);
    background: rgba(168, 85, 247, 0.06);
  }

  .trap-row {
    border-left: 3px solid rgba(248, 113, 113, 0.55);
  }

  .zone-num,
  .trap-num {
    font-family: var(--font-mono);
    font-size: 22px;
    color: var(--color-ai-mid);
    letter-spacing: 0.08em;
  }

  .zone-body,
  .trap-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .zone-tag {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .zone-row[data-tone='good'] .zone-tag {
    color: var(--color-success);
  }
  .zone-row[data-tone='ok'] .zone-tag {
    color: rgba(245, 158, 11, 1);
  }
  .zone-row[data-tone='pointer'] .zone-tag {
    color: var(--color-ai-mid);
  }

  .zone-title,
  .trap-title {
    font-family: var(--font-sans);
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.3;
    color: var(--color-text);
  }

  .zone-text,
  .trap-text {
    margin: 0;
    font-size: 20px;
    line-height: 1.5;
    color: var(--color-text-muted);
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
    line-height: 1.25;
  }

  .ic-intro {
    margin: 0 0 18px 0;
    font-size: 20px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .ic-intro strong {
    color: var(--color-text);
    font-weight: 600;
  }

  .ic-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* Header row: reuses the grid, drops the tone accents and the
     row-in animation since it is static chrome, not a data beat. */
  .ic-row.ic-header {
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 4px 18px 8px;
    opacity: 1;
    transform: none;
    animation: none;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 4px;
  }

  .ic-row.ic-header .ic-tier,
  .ic-row.ic-header .ic-examples,
  .ic-row.ic-header .ic-cover {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    font-weight: 500;
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
