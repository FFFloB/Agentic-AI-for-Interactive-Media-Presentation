<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { careContextStage } from './stage.svelte';

  let { segmentId = 'care-context' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, careContextStage));
  onDestroy(() => unregisterStage(segmentId));

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    { at: 2, text: 'Every query leaves your machine. Once sent, your inputs sit on someone else\'s servers - under their retention, their logging, their policy.' },
    { at: 3, text: 'You can feed it what you wrote, what is public, and what was made for AI. Everything else needs consent.' },
    { at: 7, text: '"Let the agent decide what is sensitive" does not work. By the time it has decided, it has already read.' },
    { at: 9, text: 'Sensitive data does not enter the pipeline. There is no safe "careful" way to pass it through.' },
  ];
  const takeawaysActive = $derived(careContextStage.reveal(takeaways[0].at));

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
    const _ = careContextStage.stageIndex;
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

  // Three-zone content for the context-rules card.
  const zones = [
    {
      tone: 'good' as const,
      tag: 'Fair to include',
      mark: 'YES',
      examples: [
        'Your own notes, writing, sketches, code, drafts.',
        'Public material: articles, documentation, reference images from the open web (terms permitting).',
        'Material that was authored specifically for AI ingestion.',
      ],
    },
    {
      tone: 'ok' as const,
      tag: 'Needs consent',
      mark: 'ASK FIRST',
      examples: [
        'Someone else\'s work, even a collaborator\'s.',
        'Material originally authored for a different context - a private memo, an unpublished paper.',
        'Shared assets with unclear licence.',
      ],
    },
    {
      tone: 'bad' as const,
      tag: 'Never',
      mark: 'NO',
      examples: [
        'Personal data, yours or anyone else\'s.',
        'Other people\'s private communications.',
        'Employer or client IP. Unreleased product information.',
        'Research-participant recordings and transcripts.',
      ],
    },
  ];
</script>

<div
  class="cx-root"
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
        <li class="takeaway" class:shown={careContextStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Ethical · Context</span>
    <h1 class="headline-gradient">What you put in</h1>
    <p class="subhead">
      You have spent the evening learning how to curate the agent's
      context. The next question is what you are allowed to put there
      in the first place. Three zones, one trap, one rule.
    </p>
  </header>

  <div class="cx-column">
    <!-- Stage 1 - framing -->
    {#if careContextStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          What can I safely feed it?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - the fact underneath: every query leaves your machine [TAKEAWAY 1] -->
    {#if careContextStage.reveal(2)}
      <div class="dataflow-card" data-staged="true">
        <div class="df-head">
          <span class="df-badge">The fact underneath</span>
          <span class="df-title">Every query leaves your machine.</span>
        </div>
        <p class="df-body">
          For almost every AI tool you use, the moment you hit send,
          your prompt - and any files, notes, or context you
          attached - travels over the internet to the provider's
          servers. The model runs there, on their hardware. The
          reply comes back. Your inputs stay in their system.
        </p>
        <div class="df-flow">
          <div class="df-step" data-tone="you">
            <div class="df-step-icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="6" width="24" height="16" rx="2"/>
                <line x1="10" y1="26" x2="22" y2="26"/>
                <line x1="16" y1="22" x2="16" y2="26"/>
              </svg>
            </div>
            <span class="df-step-num">01</span>
            <span class="df-step-title">Your device</span>
            <p class="df-step-text">
              You type. You attach. You hit send. Everything in the
              prompt now leaves.
            </p>
          </div>
          <div class="df-arrow" aria-hidden="true">→</div>
          <div class="df-step" data-tone="cloud">
            <div class="df-step-icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 22a5 5 0 0 1 .8-9.95 7 7 0 0 1 13.6 1.5A4.5 4.5 0 0 1 23 22Z"/>
              </svg>
            </div>
            <span class="df-step-num">02</span>
            <span class="df-step-title">Their cloud</span>
            <p class="df-step-text">
              The model runs in a data centre you do not control,
              on hardware that is not yours.
            </p>
          </div>
          <div class="df-arrow" aria-hidden="true">→</div>
          <div class="df-step" data-tone="kept">
            <div class="df-step-icon" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="10" width="22" height="16" rx="2"/>
                <path d="M10 10V7a6 6 0 0 1 12 0v3"/>
              </svg>
            </div>
            <span class="df-step-num">03</span>
            <span class="df-step-title">Retained</span>
            <p class="df-step-text">
              The reply comes back. Your inputs stay - under their
              retention, logging, and policy.
            </p>
          </div>
        </div>
        <div class="df-foot">
          This is why <strong>what you put in</strong> matters. Once
          it has left your machine, you cannot recall it.
        </div>
      </div>
    {/if}

    <!-- Stage 3 - three zones overview [TAKEAWAY 2] -->
    {#if careContextStage.reveal(3)}
      <div class="zones-card" data-staged="true">
        <div class="zc-head">
          <span class="zc-badge">Three zones</span>
          <span class="zc-title">Some material is yours to feed. Some isn't. Some never is.</span>
        </div>
        <div class="zc-rows">
          {#each zones as z, i (z.tag)}
            <div class="zone" data-tone={z.tone} style:--i={i}>
              <div class="z-head">
                <span class="z-mark">{z.mark}</span>
                <span class="z-tag">{z.tag}</span>
              </div>
              <ul class="z-list">
                {#each z.examples as ex (ex)}
                  <li>{ex}</li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Stage 4 - "your own stuff" - design note on what fair covers -->
    {#if careContextStage.reveal(4)}
      <div class="callout" data-staged="true">
        <div class="co-label">A permission, not a blank cheque</div>
        <p class="co-body">
          "Your own work" means work you actually made. It does not
          mean work you borrowed, saved, or found on your laptop.
          "Public material" means material whose licence permits
          what you are about to do. Public and free to view are not
          the same thing.
        </p>
      </div>
    {/if}

    <!-- Stage 5 - "never" zone deep dive -->
    {#if careContextStage.reveal(5)}
      <div class="callout danger" data-staged="true">
        <div class="co-label">The "never" zone is non-negotiable</div>
        <p class="co-body">
          Personal data - yours, a friend's, a research participant's -
          does not belong in a public AI tool. Client IP does not
          either. Neither does an unreleased brief. This is not a
          "be careful" situation. It is an "it does not go in"
          situation.
        </p>
      </div>
    {/if}

    <!-- Stage 6 - the subtle trap setup -->
    {#if careContextStage.reveal(6)}
      <div class="trap-setup" data-staged="true">
        <div class="ts-head">
          <span class="ts-badge">The intuitive workaround</span>
        </div>
        <div class="ts-body">
          <p>Many people's first instinct:</p>
          <div class="ts-quote">
            <span class="ts-q-mark">"</span>
            <span class="ts-q-text">
              Just tell the agent not to read anything sensitive. I
              will hand it the whole folder, and the system prompt
              will tell it to skip the confidential files.
            </span>
          </div>
          <p class="ts-retort">
            Look at that carefully. There is a problem.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 7 - THE TRAP [TAKEAWAY 3] - the core beat -->
    {#if careContextStage.reveal(7)}
      <div class="trap-card" data-staged="true">
        <div class="tc-head">
          <span class="tc-badge">The trap</span>
          <span class="tc-title">To decide that something is sensitive, the agent has to read it first.</span>
        </div>
        <div class="tc-diagram">
          <div class="tc-step">
            <span class="tc-step-n">1</span>
            <span class="tc-step-body">You hand over the folder.</span>
          </div>
          <div class="tc-arrow">↓</div>
          <div class="tc-step">
            <span class="tc-step-n">2</span>
            <span class="tc-step-body">The agent opens each file to check whether it is sensitive.</span>
          </div>
          <div class="tc-arrow">↓</div>
          <div class="tc-step problem">
            <span class="tc-step-n">3</span>
            <span class="tc-step-body">It has now seen everything. Including the things it was meant to skip.</span>
          </div>
        </div>
        <div class="tc-conclusion">
          <span class="tcc-label">The rule</span>
          <p class="tcc-body">
            Filtering belongs at the source, not at the agent. If a
            file should not be in the context, do not include it in
            the folder. "Don't read that one" is not a filter.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 8 - worked scenario: thesis -->
    {#if careContextStage.reveal(8)}
      <div class="scenario-card" data-staged="true">
        <div class="sc-head">
          <span class="sc-badge">Worked scenario</span>
          <span class="sc-title">Your thesis on user-interview data.</span>
        </div>
        <p class="sc-setup">
          You have a thesis draft in <code>thesis.md</code>. It
          references recorded interviews with participants - real
          names, real quotes, real consent sheets specifying that
          the recordings would be used for the thesis only. You want
          help editing the prose.
        </p>
        <div class="sc-steps">
          <div class="sc-step">
            <span class="sc-step-mark yes">✓</span>
            <span class="sc-step-body">
              <strong>Safe</strong> - hand over an anonymised draft with
              the interview quotes removed, or paraphrased beyond
              identifiability. Edit the prose only.
            </span>
          </div>
          <div class="sc-step">
            <span class="sc-step-mark no">✗</span>
            <span class="sc-step-body">
              <strong>Not safe</strong> - hand over the full draft with
              real names and quotes, trusting the agent not to
              "remember" them. Or hand over the raw transcripts.
              Both are consent breaches before anything else.
            </span>
          </div>
          <div class="sc-step">
            <span class="sc-step-mark yes">✓</span>
            <span class="sc-step-body">
              <strong>Also safe</strong> - use Google Gemini via York
              credentials for the anonymised draft. The University's
              data-protection arrangement keeps inputs out of
              training and human review.
            </span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 9 - closer [TAKEAWAY 4] -->
    {#if careContextStage.reveal(9)}
      <div class="closer" data-staged="true">
        <div class="cl-label">The one-line rule</div>
        <p class="cl-body">
          Filter at the source. If a file contains something that
          does not belong in an AI context, it does not go in the
          folder you share. "Be careful downstream" is not a
          filter; it is the problem wearing a coat.
        </p>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  /* Shared layout (matches the other care-* segments). */

  .cx-root {
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

  .cx-column {
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
  .callout.danger {
    border-color: rgba(248, 113, 113, 0.4);
    background: rgba(248, 113, 113, 0.06);
  }
  .co-label {
    font-family: var(--font-mono);
    font-size: 16px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }
  .callout.danger .co-label {
    color: var(--color-error);
  }
  .co-body {
    margin: 0;
    font-size: 25px;
    line-height: 1.5;
    color: var(--color-text);
  }

  /* === Dataflow card - the "your data leaves" fact ==================== */

  .dataflow-card {
    padding: 28px 32px;
    border: 1px solid rgba(245, 158, 11, 0.4);
    background:
      linear-gradient(180deg, rgba(245, 158, 11, 0.08), transparent 60%),
      rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    gap: 18px;
    animation: fade-in 0.55s ease-out;
  }

  .df-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .df-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: rgba(245, 158, 11, 0.85);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .df-title {
    font-family: var(--font-sans);
    font-size: 30px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--color-text);
  }

  .df-body {
    margin: 0;
    font-size: 22px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .df-flow {
    display: grid;
    grid-template-columns: 1fr 32px 1fr 32px 1fr;
    gap: 12px;
    align-items: stretch;
  }

  .df-step {
    padding: 20px 20px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .df-step[data-tone='you'] {
    border-left: 3px solid rgba(96, 165, 250, 0.55);
    color: rgba(96, 165, 250, 1);
  }

  .df-step[data-tone='cloud'] {
    border-left: 3px solid rgba(245, 158, 11, 0.7);
    color: rgba(245, 158, 11, 1);
  }

  .df-step[data-tone='kept'] {
    border-left: 3px solid rgba(248, 113, 113, 0.6);
    color: rgba(248, 113, 113, 1);
  }

  .df-step-icon {
    height: 40px;
    display: flex;
    align-items: center;
    color: inherit;
  }

  .df-step-num {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.18em;
    color: var(--color-text-subtle);
  }

  .df-step-title {
    font-family: var(--font-sans);
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: inherit;
  }

  .df-step-text {
    margin: 0;
    font-size: 17px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .df-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: var(--color-text-subtle);
  }

  .df-foot {
    padding: 14px 18px;
    background: rgba(168, 85, 247, 0.08);
    border: 1px solid var(--color-tool-border);
    border-radius: 10px;
    font-size: 20px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .df-foot strong {
    color: var(--color-ai-mid);
    font-weight: 600;
  }

  /* === Zones card - the three-zone core visual. ==================== */

  .zones-card {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    animation: fade-in 0.5s ease-out;
  }

  .zc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 18px;
    margin-bottom: 18px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .zc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .zc-title {
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  .zc-rows {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .zone {
    padding: 20px 24px;
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    opacity: 0;
    transform: translateY(8px);
    animation: row-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(var(--i) * 0.12s);
  }

  .zone[data-tone='good'] {
    border-left: 3px solid rgba(74, 222, 128, 0.6);
    background: rgba(74, 222, 128, 0.05);
  }
  .zone[data-tone='ok'] {
    border-left: 3px solid rgba(245, 158, 11, 0.6);
    background: rgba(245, 158, 11, 0.05);
  }
  .zone[data-tone='bad'] {
    border-left: 3px solid rgba(248, 113, 113, 0.6);
    background: rgba(248, 113, 113, 0.05);
  }

  .z-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    margin-bottom: 12px;
  }

  .z-mark {
    font-family: var(--font-mono);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 6px;
  }

  .zone[data-tone='good'] .z-mark {
    background: rgba(74, 222, 128, 0.2);
    color: var(--color-success);
    border: 1px solid rgba(74, 222, 128, 0.4);
  }
  .zone[data-tone='ok'] .z-mark {
    background: rgba(245, 158, 11, 0.2);
    color: var(--color-ai-end);
    border: 1px solid rgba(245, 158, 11, 0.4);
  }
  .zone[data-tone='bad'] .z-mark {
    background: rgba(248, 113, 113, 0.2);
    color: var(--color-error);
    border: 1px solid rgba(248, 113, 113, 0.4);
  }

  .z-tag {
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  .z-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .z-list li {
    font-size: 20px;
    line-height: 1.5;
    color: var(--color-text);
    padding-left: 18px;
    position: relative;
  }

  .z-list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.65em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-text-subtle);
  }

  /* === Trap setup + trap card - the key beat. ===================== */

  .trap-setup {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 26px 30px;
    animation: fade-in 0.45s ease-out;
  }

  .ts-head {
    margin-bottom: 18px;
  }

  .ts-badge {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .ts-body p {
    margin: 0;
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .ts-quote {
    margin: 16px 0;
    padding: 20px 24px;
    background: rgba(0, 0, 0, 0.3);
    border-left: 3px solid var(--color-ai-mid);
    border-radius: 0 10px 10px 0;
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 12px;
  }

  .ts-q-mark {
    font-family: var(--font-sans);
    font-size: 48px;
    line-height: 1;
    color: var(--color-ai-mid);
    font-weight: 600;
  }

  .ts-q-text {
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
    font-style: italic;
    padding-top: 12px;
  }

  .ts-retort {
    color: var(--color-text) !important;
    font-weight: 500;
  }

  .trap-card {
    border: 1px solid rgba(248, 113, 113, 0.45);
    background:
      linear-gradient(180deg, rgba(248, 113, 113, 0.1), rgba(248, 113, 113, 0.02)),
      rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-lg);
    padding: 30px 34px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    animation: fade-in 0.55s ease-out;
    box-shadow: 0 24px 64px -24px rgba(248, 113, 113, 0.32);
  }

  .tc-head {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
  }

  .tc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--color-error);
    padding: 5px 12px;
    border-radius: 6px;
    align-self: flex-start;
  }

  .tc-title {
    font-family: var(--font-sans);
    font-size: 32px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--color-text);
  }

  .tc-diagram {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .tc-step {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 18px;
    align-items: center;
    width: 100%;
    padding: 16px 22px;
    background: rgba(0, 0, 0, 0.32);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .tc-step.problem {
    border-color: rgba(248, 113, 113, 0.55);
    background: rgba(248, 113, 113, 0.08);
    box-shadow: 0 0 32px -8px rgba(248, 113, 113, 0.35);
  }

  .tc-step-n {
    font-family: var(--font-mono);
    font-size: 22px;
    font-weight: 600;
    color: var(--color-ai-mid);
    text-align: center;
  }

  .tc-step.problem .tc-step-n {
    color: var(--color-error);
  }

  .tc-step-body {
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .tc-arrow {
    font-size: 24px;
    color: var(--color-text-subtle);
    line-height: 1;
  }

  .tc-conclusion {
    padding: 20px 24px;
    background: rgba(168, 85, 247, 0.1);
    border: 1px solid var(--color-tool-border);
    border-radius: 10px;
  }

  .tcc-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
    display: block;
    margin-bottom: 8px;
  }

  .tcc-body {
    margin: 0;
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
  }

  /* === Scenario card - thesis worked example. ===================== */

  .scenario-card {
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
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
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

  .sc-title {
    font-family: var(--font-sans);
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  .sc-setup {
    margin: 0;
    font-size: 22px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .sc-setup code {
    font-family: var(--font-mono);
    font-size: 0.9em;
    background: rgba(0, 0, 0, 0.35);
    padding: 2px 8px;
    border-radius: 4px;
    color: var(--color-text);
  }

  .sc-steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sc-step {
    display: grid;
    grid-template-columns: 44px 1fr;
    gap: 18px;
    align-items: baseline;
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .sc-step-mark {
    font-family: var(--font-mono);
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    line-height: 1;
    padding-top: 4px;
  }

  .sc-step-mark.yes {
    color: var(--color-success);
  }

  .sc-step-mark.no {
    color: var(--color-error);
  }

  .sc-step-body {
    font-size: 21px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .sc-step-body strong {
    color: var(--color-text);
    font-weight: 600;
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

  /* Takeaways rail (shared pattern) */

  .tail-spacer {
    height: 240px;
  }

  .cx-root .segment-header,
  .cx-root .cx-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .cx-root.two-col .segment-header,
  .cx-root.two-col .cx-column {
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
