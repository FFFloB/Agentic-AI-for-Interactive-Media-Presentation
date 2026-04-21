<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { careOwnershipStage } from './stage.svelte';

  let { segmentId = 'care-ownership' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, careOwnershipStage));
  onDestroy(() => unregisterStage(segmentId));

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    { at: 2, text: 'Human creative input earns you copyright in the UK. Writing a prompt alone does not.' },
    { at: 3, text: 'The test is already in UK law: the "author\'s own intellectual creation" standard. It asks for your personal touch, not prompt length.' },
    { at: 5, text: 'The direction of travel favours AI-assisted work with real human input. Build the habit now, you\'re safe whichever way the rules move.' },
  ];
  const takeawaysActive = $derived(careOwnershipStage.reveal(takeaways[0].at));

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
    const _ = careOwnershipStage.stageIndex;
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

  // Three scenarios card - the core conceptual beat.
  const scenarios = [
    {
      tone: 'good' as const,
      tag: 'AI-assisted',
      verdict: 'You are the author',
      term: 'Normal copyright · life + 70 years',
      body: 'You made substantive creative choices. The model was a tool: you concepted, iterated, composed, edited, integrated. Copyright sits with you the same way it would for any other tool-assisted work.',
    },
    {
      tone: 'ok' as const,
      tag: 's.9(3) CDPA',
      verdict: 'Computer-generated work with no human author',
      term: '50-year term · "author" = arranger',
      body: 'A 1988 UK oddity, written with procedurally generated maps in mind. Never authoritatively tested against a modern prompt-to-image model. The March 2026 government report proposes removing it. Live law, politically shaky.',
    },
    {
      tone: 'bad' as const,
      tag: 'Purely AI-generated',
      verdict: 'Likely unprotected',
      term: 'Weak or no copyright claim',
      body: 'You typed a prompt and accepted the first output. Most commentary, and the direction of the March 2026 government report, treats this as unprotected in any stable way.',
    },
  ];
</script>

<div
  class="co-root"
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
        <li class="takeaway" class:shown={careOwnershipStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Legal · Ownership</span>
    <h1 class="headline-gradient">Who owns this?</h1>
    <p class="subhead">
      Whether what you ship is really yours turns on one question: did
      you do the creative thinking? UK law is already clear about this,
      even if the statute around it is in motion.
    </p>
  </header>

  <div class="co-column">
    <!-- Stage 1 - framing -->
    {#if careOwnershipStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          If I ship this, is it mine?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - three scenarios [TAKEAWAY 1] -->
    {#if careOwnershipStage.reveal(2)}
      <div class="scenarios" data-staged="true">
        <div class="sc-head">
          <span class="sc-badge">Three scenarios</span>
          <span class="sc-title">One law, three different answers.</span>
        </div>
        <div class="sc-cards">
          {#each scenarios as s, i (s.tag)}
            <div class="scenario" data-tone={s.tone} style:--i={i}>
              <div class="s-tag">{s.tag}</div>
              <div class="s-verdict">{s.verdict}</div>
              <div class="s-term">{s.term}</div>
              <p class="s-body">{s.body}</p>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Stage 3 - the test that decides [TAKEAWAY 2] -->
    {#if careOwnershipStage.reveal(3)}
      <div class="source-card" data-staged="true">
        <div class="sc-head">
          <span class="sc-badge">The test</span>
          <span class="sc-citation">Infopaq · re-affirmed in THJ v Sheridan [2023]</span>
        </div>
        <div class="sc-title">Author's own intellectual creation.</div>
        <p class="sc-body">
          The UK originality threshold for copyright is the EU-derived
          "author's own intellectual creation" standard. It asks for
          expressive choices reflecting your personal touch - not
          skill, labour, or technical effort. Arnold LJ re-confirmed
          this in <em>THJ v Sheridan</em> in 2023.
        </p>
        <div class="sc-meaning">
          <span class="sm-label">What this means for your work</span>
          <div class="sm-body">
            <div class="sm-line"><span class="sm-mark no">no</span><span>Writing a prompt and accepting the first output.</span></div>
            <div class="sm-line"><span class="sm-mark yes">yes</span><span>Selecting from alternatives, iterating, composing, editing, integrating into something larger.</span></div>
            <p class="sm-note">
              The bar is not high, but it is a real bar. A good
              portfolio piece will clear it easily. A glossy
              hands-off generation will not.
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 4 - what's moving -->
    {#if careOwnershipStage.reveal(4)}
      <div class="source-card" data-staged="true">
        <div class="sc-head">
          <span class="sc-badge">Moving target</span>
          <span class="sc-citation">UK Gov · Report on Copyright and AI, 18 March 2026</span>
        </div>
        <div class="sc-title">s.9(3) is proposed for repeal.</div>
        <p class="sc-body">
          The government's March 2026 report proposes removing section
          9(3) CDPA - the 1988 provision that confers a 50-year
          "computer-generated works" copyright. The logic: keep
          protection for AI-assisted work with genuine human
          contribution; stop pretending prompt-only output has a
          meaningful author.
        </p>
        <div class="sc-meaning">
          <span class="sm-label">What this means for you</span>
          <p class="sm-body-p">
            No legislation yet, but the direction of travel is clear.
            The prompt-and-accept path is being closed off. The
            AI-assisted path, where you do real creative work on top
            of generated material, is the one the law is moving to
            protect.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 5 - decision rubric [TAKEAWAY 3] -->
    {#if careOwnershipStage.reveal(5)}
      <div class="rubric-card" data-staged="true">
        <div class="rc-head">
          <span class="rc-badge">Decision rubric</span>
          <span class="rc-title">Two questions to ask yourself.</span>
        </div>
        <div class="rc-questions">
          <div class="rc-q">
            <span class="rc-q-num">01</span>
            <span class="rc-q-body">Did I make substantive expressive choices - concept, composition, selection, editing, integration?</span>
          </div>
          <div class="rc-q">
            <span class="rc-q-num">02</span>
            <span class="rc-q-body">Could a stranger with the same tool and a short prompt have made something meaningfully the same?</span>
          </div>
        </div>
        <div class="rc-branches">
          <div class="rc-branch yes">
            <div class="rc-branch-head">
              <span class="rc-branch-pair">Yes · No</span>
              <span class="rc-branch-verdict">AI-assisted</span>
            </div>
            <p class="rc-branch-body">
              You are the author. Claim the work, declare the tool,
              describe your role. You can submit, license, or sell
              it on normal terms.
            </p>
          </div>
          <div class="rc-branch no">
            <div class="rc-branch-head">
              <span class="rc-branch-pair">No · Yes</span>
              <span class="rc-branch-verdict">Prompt-only</span>
            </div>
            <p class="rc-branch-body">
              Do not claim authorship. If you put this in a
              portfolio, label it as generated and describe its role
              (reference, exploration, mood board). Do not ship it
              as your work.
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 6 - closer -->
    {#if careOwnershipStage.reveal(6)}
      <div class="closer" data-staged="true">
        <div class="cl-label">The principle that survives the statute</div>
        <p class="cl-body">
          Copyright law rewards human creative thinking. That
          principle has been steady through every technology change
          for the last century, and it is not changing for this one.
          You are the author only if you did the thinking. Do the
          thinking, and the statute can move without moving you.
        </p>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  /* Reused shared layout - same as the other care segments. */

  .co-root {
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

  .co-column {
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

  /* === Three scenarios card - key conceptual beat ==================== */

  .scenarios {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    animation: fade-in 0.5s ease-out;
  }

  .scenarios .sc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 18px;
    margin-bottom: 18px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .scenarios .sc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .scenarios .sc-title {
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  .sc-cards {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .scenario {
    padding: 22px 24px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 18px 24px;
    align-items: baseline;
    opacity: 0;
    transform: translateY(8px);
    animation: row-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(var(--i) * 0.15s);
  }

  .scenario[data-tone='good'] {
    border-left: 3px solid rgba(74, 222, 128, 0.6);
  }
  .scenario[data-tone='ok'] {
    border-left: 3px solid rgba(245, 158, 11, 0.6);
  }
  .scenario[data-tone='bad'] {
    border-left: 3px solid rgba(248, 113, 113, 0.6);
  }

  .s-tag {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    grid-row: 1;
  }

  .s-verdict {
    font-family: var(--font-sans);
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.25;
    color: var(--color-text);
    grid-row: 1;
    grid-column: 2;
  }

  .scenario[data-tone='good'] .s-verdict {
    color: var(--color-success);
  }
  .scenario[data-tone='bad'] .s-verdict {
    color: var(--color-error);
  }

  .s-term {
    grid-column: 1;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--color-text-subtle);
    letter-spacing: 0.04em;
  }

  .s-body {
    grid-column: 2;
    margin: 0;
    font-size: 19px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  /* === Source card (reused pattern from care-training) =============== */

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

  .source-card .sc-citation {
    font-family: var(--font-mono);
    font-size: 17px;
    color: var(--color-text);
    letter-spacing: 0.02em;
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

  .source-card .sc-body em {
    font-style: italic;
    color: var(--color-ai-mid);
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

  .sm-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sm-body-p {
    margin: 0;
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .sm-line {
    display: grid;
    grid-template-columns: 68px 1fr;
    gap: 14px;
    align-items: baseline;
    font-size: 21px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .sm-mark {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 9999px;
    text-align: center;
  }

  .sm-mark.no {
    background: rgba(248, 113, 113, 0.15);
    color: var(--color-error);
    border: 1px solid rgba(248, 113, 113, 0.35);
  }

  .sm-mark.yes {
    background: rgba(74, 222, 128, 0.15);
    color: var(--color-success);
    border: 1px solid rgba(74, 222, 128, 0.35);
  }

  .sm-note {
    margin: 4px 0 0 0;
    font-size: 19px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  /* === Rubric card =================================================== */

  .rubric-card {
    border: 1px solid var(--color-border-strong);
    background:
      linear-gradient(180deg, rgba(168, 85, 247, 0.06), transparent 60%),
      rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    animation: fade-in 0.55s ease-out;
    box-shadow: 0 24px 64px -32px rgba(168, 85, 247, 0.28);
  }

  .rc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
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
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  .rc-questions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .rc-q {
    display: grid;
    grid-template-columns: 64px 1fr;
    gap: 18px;
    align-items: baseline;
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .rc-q-num {
    font-family: var(--font-mono);
    font-size: 22px;
    color: var(--color-ai-mid);
    letter-spacing: 0.08em;
  }

  .rc-q-body {
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .rc-branches {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .rc-branch {
    padding: 20px 22px;
    border-radius: 10px;
    border: 1px solid var(--color-border);
    background: rgba(0, 0, 0, 0.22);
  }

  .rc-branch.yes {
    border-color: rgba(74, 222, 128, 0.45);
    background: rgba(74, 222, 128, 0.06);
  }

  .rc-branch.no {
    border-color: rgba(248, 113, 113, 0.45);
    background: rgba(248, 113, 113, 0.05);
  }

  .rc-branch-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 10px;
  }

  .rc-branch-pair {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .rc-branch-verdict {
    font-family: var(--font-sans);
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .rc-branch.yes .rc-branch-verdict {
    color: var(--color-success);
  }

  .rc-branch.no .rc-branch-verdict {
    color: var(--color-error);
  }

  .rc-branch-body {
    margin: 0;
    font-size: 20px;
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

  /* === Takeaways rail ================================================ */

  .tail-spacer {
    height: 240px;
  }

  .co-root .segment-header,
  .co-root .co-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .co-root.two-col .segment-header,
  .co-root.two-col .co-column {
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
