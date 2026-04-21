<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { careNumbersStage } from './stage.svelte';

  let { segmentId = 'care-numbers' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, careNumbersStage));
  onDestroy(() => unregisterStage(segmentId));

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  // Stats derived from audit data (scripts/build-audit-data.mjs) and git.
  // Refresh when a new session concludes; see /rebuild-audit.
  const stats = {
    days: 54.5,
    workHours: 14,
    humanPrompts: 124,
    aiReplies: 318,
    thinkingBlocks: 285,
    toolUses: 975,
    tools: [
      { name: 'Edit', count: 327, cat: 'file' },
      { name: 'Bash', count: 234, cat: 'shell' },
      { name: 'Read', count: 142, cat: 'file' },
      { name: 'Write', count: 116, cat: 'file' },
      { name: 'TaskUpdate', count: 80, cat: 'plan' },
      { name: 'TaskCreate', count: 40, cat: 'plan' },
      { name: 'Grep', count: 18, cat: 'file' },
      { name: 'Glob', count: 5, cat: 'file' },
      { name: 'Other', count: 13, cat: 'other' },
    ] as const,
    commitsTotal: 29,
    commitsCoAuthored: 23,
    linesAdded: 8179,
    linesRemoved: 992,
    filesTotal: 77,
    linesTotal: 29993,
    segments: 18,
  };

  // Per-prompt leverage ratio (the money shot).
  const ratio = {
    tools: stats.toolUses / stats.humanPrompts,
    replies: stats.aiReplies / stats.humanPrompts,
    thinks: stats.thinkingBlocks / stats.humanPrompts,
  };
  const ratioTotalAIActions = ratio.tools + ratio.replies + ratio.thinks;

  const toolMax = Math.max(...stats.tools.map((t) => t.count));

  // Commit attribution strip: 29 cells, 23 co-authored.
  const commitCells = Array.from({ length: stats.commitsTotal }, (_, i) => ({
    coAuthored: i < stats.commitsCoAuthored,
  }));

  const takeaways = [
    { at: 4, text: 'Leverage: around eight AI actions per human prompt is achievable with clear direction. The skill is the direction, not the typing.' },
    { at: 6, text: 'Every commit carries your name. 79% also name the collaborator honestly. Attribution beats concealment, every time.' },
    { at: 8, text: 'Per query, the cost is small. At the scale these tools now run, the aggregate is a city. Both are true.' },
  ];
  const takeawaysActive = $derived(careNumbersStage.reveal(takeaways[0].at));

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
    const _ = careNumbersStage.stageIndex;
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
  class="cn-root"
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
        <li class="takeaway" class:shown={careNumbersStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Transparency · In numbers</span>
    <h1 class="headline-gradient">The audit, quantified</h1>
    <p class="subhead">
      The timeline showed what happened. These numbers show how much of
      it was you, how much was the agent, and what it actually cost.
    </p>
  </header>

  <div class="cn-column">
    <!-- Stage 1 - framing -->
    {#if careNumbersStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          So how much of this talk did I actually write?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - span hero card -->
    {#if careNumbersStage.reveal(2)}
      <div class="hero-split" data-staged="true">
        <div class="hs-card primary">
          <div class="hs-num">{stats.days}</div>
          <div class="hs-unit">days</div>
          <div class="hs-sub">From first commit to now. Real calendar time.</div>
        </div>
        <div class="hs-card">
          <div class="hs-num">~{stats.workHours}</div>
          <div class="hs-unit">hours</div>
          <div class="hs-sub">Of which was actual keyboard time in a session.</div>
          <div class="hs-bar">
            <div class="hs-bar-fill" style:width="{(stats.workHours / (stats.days * 24)) * 100 * 20}%"></div>
          </div>
          <div class="hs-bar-note">
            {Math.round((stats.workHours / (stats.days * 24)) * 1000) / 10}%
            of elapsed time. The rest was thinking, sleeping, eating,
            reading the output.
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 3 - counts grid -->
    {#if careNumbersStage.reveal(3)}
      <div class="count-grid" data-staged="true">
        <div class="count-card you">
          <div class="cc-label">You wrote</div>
          <div class="cc-num">{stats.humanPrompts}</div>
          <div class="cc-unit">prompts</div>
          <div class="cc-sub">Every word of direction you gave.</div>
        </div>
        <div class="count-card ai">
          <div class="cc-label">The agent answered with</div>
          <div class="cc-row-nums">
            <div><span class="cc-num-inline">{stats.aiReplies}</span><span class="cc-unit-inline">replies</span></div>
            <div><span class="cc-num-inline">{stats.thinkingBlocks}</span><span class="cc-unit-inline">thoughts</span></div>
            <div><span class="cc-num-inline">{stats.toolUses}</span><span class="cc-unit-inline">tool uses</span></div>
          </div>
          <div class="cc-sub">Text, thinking cycles, and actions on files.</div>
        </div>
      </div>
    {/if}

    <!-- Stage 4 - THE RATIO reveal [TAKEAWAY 1] -->
    {#if careNumbersStage.reveal(4)}
      <div class="ratio-card" data-staged="true">
        <div class="rc-head">
          <span class="rc-badge">The ratio</span>
          <span class="rc-title">For every one prompt you wrote...</span>
        </div>
        <div class="rc-row you">
          <span class="rr-label">YOU</span>
          <div class="rc-bar">
            <div class="rc-bar-fill human" style:width="{(1 / (1 + ratioTotalAIActions)) * 100}%"></div>
          </div>
          <span class="rc-count">1 prompt</span>
        </div>
        <div class="rc-row ai">
          <span class="rr-label">AI</span>
          <div class="rc-bar">
            <div
              class="rc-bar-fill tools"
              style:width="{(ratio.tools / (1 + ratioTotalAIActions)) * 100}%"
              title="tool uses"
            ></div>
            <div
              class="rc-bar-fill replies"
              style:width="{(ratio.replies / (1 + ratioTotalAIActions)) * 100}%"
              title="text replies"
            ></div>
            <div
              class="rc-bar-fill thinks"
              style:width="{(ratio.thinks / (1 + ratioTotalAIActions)) * 100}%"
              title="thinking cycles"
            ></div>
          </div>
          <span class="rc-count">{ratio.tools.toFixed(1)} + {ratio.replies.toFixed(1)} + {ratio.thinks.toFixed(1)}</span>
        </div>
        <div class="rc-legend">
          <span class="rc-leg-item"><span class="rc-leg-dot human"></span>1 prompt (your direction)</span>
          <span class="rc-leg-item"><span class="rc-leg-dot tools"></span>{ratio.tools.toFixed(1)} tool uses</span>
          <span class="rc-leg-item"><span class="rc-leg-dot replies"></span>{ratio.replies.toFixed(1)} replies</span>
          <span class="rc-leg-item"><span class="rc-leg-dot thinks"></span>{ratio.thinks.toFixed(1)} thinking cycles</span>
        </div>
        <div class="rc-verdict">
          The typical ratio is about <strong>{Math.round(ratioTotalAIActions)} AI actions per human prompt</strong>.
          That is the leverage the directorial role buys you, if you are willing to read and review.
        </div>
      </div>
    {/if}

    <!-- Stage 5 - Tool breakdown -->
    {#if careNumbersStage.reveal(5)}
      <div class="tools-card" data-staged="true">
        <div class="tc-head">
          <span class="tc-badge">What the agent actually did</span>
          <span class="tc-title">{stats.toolUses} tool uses, broken down.</span>
        </div>
        <div class="tc-bars">
          {#each stats.tools as t (t.name)}
            <div class="tc-row" data-cat={t.cat}>
              <span class="tc-name">{t.name}</span>
              <div class="tc-bar-track">
                <div class="tc-bar-fill" style:width="{(t.count / toolMax) * 100}%"></div>
              </div>
              <span class="tc-count">{t.count}</span>
            </div>
          {/each}
        </div>
        <div class="tc-foot">
          <span class="tcf-note">
            Edit + Read + Write + Grep + Glob = <strong>file operations</strong> (the bulk).
            Bash = shell commands. TaskCreate / TaskUpdate = planning.
            Notable: Edit dominates. This wasn't generation-from-scratch,
            it was <em>iterative refinement</em>.
          </span>
        </div>
      </div>
    {/if}

    <!-- Stage 6 - Git attribution + codebase [TAKEAWAY 2] -->
    {#if careNumbersStage.reveal(6)}
      <div class="git-card" data-staged="true">
        <div class="gc-head">
          <span class="gc-badge">The commit log</span>
          <span class="gc-title">Every commit carries your name. Most name the collaborator, too.</span>
        </div>
        <div class="gc-strip">
          {#each commitCells as cell, i (i)}
            <div class="gc-cell" class:co-authored={cell.coAuthored}></div>
          {/each}
        </div>
        <div class="gc-legend">
          <span class="gcl-item"><span class="gcl-dot co"></span>{stats.commitsCoAuthored} co-authored with the agent</span>
          <span class="gcl-item"><span class="gcl-dot solo"></span>{stats.commitsTotal - stats.commitsCoAuthored} human-only (mostly automated log commits)</span>
          <span class="gcl-stat">{Math.round((stats.commitsCoAuthored / stats.commitsTotal) * 100)}% honestly attributed</span>
        </div>
        <div class="gc-churn">
          <div class="gcc-item">
            <span class="gcc-num">{stats.linesAdded.toLocaleString()}</span>
            <span class="gcc-unit">lines added</span>
          </div>
          <div class="gcc-item">
            <span class="gcc-num">{stats.linesRemoved.toLocaleString()}</span>
            <span class="gcc-unit">lines removed</span>
          </div>
          <div class="gcc-item">
            <span class="gcc-num">{stats.filesTotal}</span>
            <span class="gcc-unit">files in the repo</span>
          </div>
          <div class="gcc-item">
            <span class="gcc-num">{stats.linesTotal.toLocaleString()}</span>
            <span class="gcc-unit">total lines of code, docs, data</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 7 - the role takeaway -->
    {#if careNumbersStage.reveal(7)}
      <div class="role-card" data-staged="true">
        <div class="rc2-label">What this says about the role</div>
        <p class="rc2-body">
          The role changes. The skill moves up the stack. You are not
          the editor of every line in this project. You are the person
          who <strong>decided what should be said</strong>,
          <strong>spotted when the agent drifted</strong>, and
          <strong>reviewed everything that shipped under your name</strong>.
          That is still a full-time craft. It is just a different one.
        </p>
      </div>
    {/if}

    <!-- Stage 8 - Environmental hero + segue [TAKEAWAY 3] -->
    {#if careNumbersStage.reveal(8)}
      <div class="env-hero" data-staged="true">
        <div class="eh-label">And the cost?</div>
        <div class="eh-big">About one cheeseburger.</div>
        <div class="eh-stats">
          <div class="ehs-item">
            <span class="ehs-num">~4.5</span>
            <span class="ehs-unit">kWh</span>
            <span class="ehs-sub">electricity (mid)</span>
          </div>
          <div class="ehs-item">
            <span class="ehs-num">~2-3</span>
            <span class="ehs-unit">kg CO<sub>2</sub>e</span>
            <span class="ehs-sub">grid-dependent (mid)</span>
          </div>
          <div class="ehs-item">
            <span class="ehs-num">~15-40</span>
            <span class="ehs-unit">L water</span>
            <span class="ehs-sub">cooling, mid range</span>
          </div>
        </div>
        <div class="eh-range">
          <span class="ehr-label">Honest range:</span>
          <span class="ehr-body">
            0.15 kg CO<sub>2</sub> (Oregon hydro, cache-warm) to 8 kg
            CO<sub>2</sub> (Virginia gas, cache-cold). Independent
            estimates; vendor figures run ~10× lower but exclude
            upstream power-plant water and location-based grid
            emissions.
          </span>
        </div>
        <div class="eh-segue">
          Next: what one cheeseburger actually means.
        </div>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  /* === Shared layout scaffolding (matches other care-* segments). === */

  .cn-root {
    width: 100%;
    height: 100%;
    padding: 120px 0 180px 0;
    position: relative;
  }

  .segment-header {
    width: min(920px, 100%);
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

  .cn-column {
    width: min(920px, 100%);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  /* User bubble (shared) */
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

  /* === Hero split (stage 2): span + working time ==================== */

  .hero-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    animation: fade-in 0.5s ease-out;
  }

  .hs-card {
    padding: 32px 34px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.02);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .hs-card.primary {
    background:
      linear-gradient(160deg, rgba(168, 85, 247, 0.14), rgba(236, 72, 153, 0.06) 60%),
      rgba(0, 0, 0, 0.2);
    border-color: var(--color-tool-border);
    box-shadow: 0 24px 64px -24px rgba(168, 85, 247, 0.3);
  }

  .hs-num {
    font-family: var(--font-sans);
    font-size: 120px;
    font-weight: 600;
    letter-spacing: -0.04em;
    line-height: 1;
    background: var(--gradient-headline);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    padding-bottom: 0.05em;
  }

  .hs-card:not(.primary) .hs-num {
    background: none;
    -webkit-background-clip: unset;
    background-clip: unset;
    color: var(--color-text);
  }

  .hs-unit {
    font-family: var(--font-mono);
    font-size: 22px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .hs-sub {
    margin-top: 6px;
    font-size: 22px;
    line-height: 1.45;
    color: var(--color-text-muted);
  }

  .hs-bar {
    margin-top: 14px;
    height: 8px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 4px;
    overflow: hidden;
  }

  .hs-bar-fill {
    height: 100%;
    background: var(--gradient-accent);
    border-radius: 4px;
  }

  .hs-bar-note {
    font-size: 17px;
    line-height: 1.45;
    color: var(--color-text-subtle);
  }

  /* === Count grid (stage 3): prompts vs replies/thinks/tools ======== */

  .count-grid {
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    gap: 20px;
    animation: fade-in 0.5s ease-out;
  }

  .count-card {
    padding: 28px 32px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.02);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .count-card.you {
    border-left: 3px solid rgba(52, 211, 153, 0.7);
    background:
      linear-gradient(90deg, rgba(52, 211, 153, 0.06), transparent 60%),
      rgba(255, 255, 255, 0.02);
  }

  .count-card.ai {
    border-left: 3px solid rgba(236, 72, 153, 0.7);
    background:
      linear-gradient(90deg, rgba(236, 72, 153, 0.06), transparent 60%),
      rgba(255, 255, 255, 0.02);
  }

  .cc-label {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .cc-num {
    font-family: var(--font-sans);
    font-size: 96px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1;
    color: var(--color-text);
    padding-bottom: 0.05em;
  }

  .cc-unit {
    font-family: var(--font-mono);
    font-size: 20px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .cc-sub {
    margin-top: 8px;
    font-size: 18px;
    line-height: 1.45;
    color: var(--color-text-muted);
  }

  .cc-row-nums {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .cc-row-nums > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .cc-num-inline {
    font-family: var(--font-sans);
    font-size: 44px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--color-text);
  }

  .cc-unit-inline {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  /* === Ratio card (stage 4) - THE money shot ======================== */

  .ratio-card {
    padding: 32px 36px;
    border: 1px solid var(--color-tool-border);
    border-radius: var(--radius-lg);
    background:
      linear-gradient(180deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.04)),
      rgba(0, 0, 0, 0.2);
    box-shadow: 0 24px 64px -24px rgba(236, 72, 153, 0.32);
    animation: fade-in 0.55s ease-out;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .rc-head {
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .rc-badge {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  .rc-title {
    font-family: var(--font-sans);
    font-size: 34px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--color-text);
  }

  .rc-row {
    display: grid;
    grid-template-columns: 56px 1fr 240px;
    gap: 18px;
    align-items: center;
  }

  .rr-label {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    text-align: right;
  }

  .rc-bar {
    height: 40px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
  }

  .rc-bar-fill {
    height: 100%;
    transform-origin: left center;
    animation: bar-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .rc-bar-fill.human {
    background: var(--color-human);
  }
  .rc-bar-fill.tools {
    background: rgba(96, 165, 250, 0.9);
  }
  .rc-bar-fill.replies {
    background: rgba(236, 72, 153, 0.9);
  }
  .rc-bar-fill.thinks {
    background: rgba(200, 200, 220, 0.7);
  }

  .rc-count {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--color-text);
    text-align: left;
  }

  .rc-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 14px 20px;
    padding: 10px 0 0;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--color-text-muted);
  }

  .rc-leg-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .rc-leg-dot {
    width: 12px;
    height: 8px;
    border-radius: 2px;
  }

  .rc-leg-dot.human { background: var(--color-human); }
  .rc-leg-dot.tools { background: rgba(96, 165, 250, 0.9); }
  .rc-leg-dot.replies { background: rgba(236, 72, 153, 0.9); }
  .rc-leg-dot.thinks { background: rgba(200, 200, 220, 0.7); }

  .rc-verdict {
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .rc-verdict strong {
    color: var(--color-ai-mid);
    font-weight: 600;
  }

  /* === Tools card (stage 5): ranked bars ============================= */

  .tools-card {
    padding: 28px 32px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.02);
    animation: fade-in 0.5s ease-out;
  }

  .tc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 18px;
    margin-bottom: 18px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

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

  .tc-title {
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  .tc-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tc-row {
    display: grid;
    grid-template-columns: 140px 1fr 60px;
    gap: 16px;
    align-items: center;
  }

  .tc-name {
    font-family: var(--font-mono);
    font-size: 17px;
    color: var(--color-text);
  }

  .tc-bar-track {
    height: 18px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 4px;
    overflow: hidden;
  }

  .tc-bar-fill {
    height: 100%;
    border-radius: 4px;
    transform-origin: left center;
    animation: bar-grow 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .tc-row[data-cat='file'] .tc-bar-fill {
    background: rgba(96, 165, 250, 0.85);
  }
  .tc-row[data-cat='shell'] .tc-bar-fill {
    background: rgba(245, 158, 11, 0.85);
  }
  .tc-row[data-cat='plan'] .tc-bar-fill {
    background: rgba(168, 85, 247, 0.85);
  }
  .tc-row[data-cat='other'] .tc-bar-fill {
    background: rgba(200, 200, 220, 0.55);
  }

  .tc-count {
    font-family: var(--font-mono);
    font-size: 17px;
    color: var(--color-text-muted);
    text-align: right;
  }

  .tc-foot {
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid var(--color-border);
    font-size: 18px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .tc-foot strong {
    color: var(--color-text);
  }

  .tc-foot em {
    font-style: italic;
    color: var(--color-ai-mid);
  }

  /* === Git card (stage 6): commit strip + churn stats =============== */

  .git-card {
    padding: 28px 32px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.02);
    animation: fade-in 0.5s ease-out;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .gc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .gc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .gc-title {
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  .gc-strip {
    display: grid;
    grid-template-columns: repeat(29, 1fr);
    gap: 4px;
  }

  .gc-cell {
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 4px;
  }

  .gc-cell.co-authored {
    background: rgba(236, 72, 153, 0.28);
    border-color: rgba(236, 72, 153, 0.65);
    box-shadow: 0 0 16px -4px rgba(236, 72, 153, 0.5);
  }

  .gc-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 14px 22px;
    align-items: baseline;
    font-family: var(--font-mono);
    font-size: 15px;
    color: var(--color-text-muted);
  }

  .gcl-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .gcl-dot {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }

  .gcl-dot.co {
    background: rgba(236, 72, 153, 0.4);
    border: 1px solid rgba(236, 72, 153, 0.75);
  }

  .gcl-dot.solo {
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .gcl-stat {
    margin-left: auto;
    color: var(--color-ai-mid);
    font-weight: 500;
    letter-spacing: 0.08em;
  }

  .gc-churn {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }

  .gcc-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .gcc-num {
    font-family: var(--font-sans);
    font-size: 34px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--color-text);
    line-height: 1;
  }

  .gcc-unit {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  /* === Role card (stage 7): the soft director takeaway ============== */

  .role-card {
    padding: 30px 34px;
    border: 1px solid var(--color-tool-border);
    border-radius: var(--radius-lg);
    background: rgba(168, 85, 247, 0.08);
    animation: fade-in 0.5s ease-out;
  }

  .rc2-label {
    font-family: var(--font-mono);
    font-size: 17px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
    margin-bottom: 18px;
  }

  .rc2-body {
    margin: 0;
    font-size: 26px;
    line-height: 1.55;
    color: var(--color-text);
  }

  .rc2-body strong {
    color: var(--color-ai-mid);
    font-weight: 600;
  }

  /* === Environmental hero (stage 8) ================================= */

  .env-hero {
    padding: 36px 38px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background:
      linear-gradient(160deg, rgba(74, 222, 128, 0.1), transparent 50%),
      linear-gradient(180deg, rgba(168, 85, 247, 0.08), transparent 60%),
      rgba(0, 0, 0, 0.2);
    animation: fade-in 0.55s ease-out;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .eh-label {
    font-family: var(--font-mono);
    font-size: 18px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .eh-big {
    font-family: var(--font-sans);
    font-size: 64px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.1;
    background: var(--gradient-headline);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    padding-bottom: 0.06em;
  }

  .eh-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    padding: 18px 0;
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
  }

  .ehs-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ehs-num {
    font-family: var(--font-sans);
    font-size: 44px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--color-text);
  }

  .ehs-unit {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.1em;
    color: var(--color-text);
    text-transform: uppercase;
  }

  .ehs-sub {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.08em;
    color: var(--color-text-subtle);
    text-transform: uppercase;
  }

  .eh-range {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 18px;
    padding: 14px 18px;
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .ehr-label {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .ehr-body {
    font-size: 16px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  .eh-segue {
    font-family: var(--font-mono);
    font-size: 16px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  /* === Takeaways rail (shared) ======================================= */

  .tail-spacer {
    height: 240px;
  }

  .cn-root .segment-header,
  .cn-root .cn-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .cn-root.two-col .segment-header,
  .cn-root.two-col .cn-column {
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
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes bar-grow {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
</style>
