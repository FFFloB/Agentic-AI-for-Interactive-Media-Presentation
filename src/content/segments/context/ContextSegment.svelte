<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { contextStage, CTX } from './stage.svelte';
  import { mode } from '$content/mode.svelte';

  let { segmentId = 'context' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, contextStage));
  onDestroy(() => unregisterStage(segmentId));

  // === Phase helpers ===================================================

  const beforeMorph = $derived(contextStage.stageIndex < CTX.MORPH_TO_DIALOG);
  const afterMorph = $derived(contextStage.stageIndex >= CTX.MORPH_TO_DIALOG);

  // The chart on the right is hidden until the morph. Then it pins to the
  // viewport via a transform that tracks camera.y, staying in view while
  // the left column keeps scrolling.
  const chartVisible = $derived(afterMorph);

  const compressing = $derived(contextStage.stageIndex === CTX.COMPRESS);
  const freshSession = $derived(
    contextStage.stageIndex >= CTX.FRESH_SESSION &&
      contextStage.stageIndex < CTX.RESET,
  );
  const reset = $derived(contextStage.stageIndex >= CTX.RESET);
  const inFillup = $derived(
    contextStage.stageIndex >= CTX.FILL_1 &&
      contextStage.stageIndex <= CTX.FILL_3,
  );

  const takeaways = [
    'Context is assembled from six parts: system prompt, tools, memory, dialog, free space, and a summarisation buffer.',
    'Dialog grows with every turn. Once it nears the limit it has to be compressed to make room.',
    'Starting a new session wipes the dialog. Only the summary carries over, not the exact words.',
    'System prompt, tools and memory persist across sessions. Memory is what lets the agent stay oriented.',
  ];

  // === Dialog / buffer fill ============================================

  const dialogFill = $derived.by(() => {
    const s = contextStage.stageIndex;
    if (s < CTX.MORPH_TO_DIALOG) return 0;
    if (s < CTX.FILL_1) return 0.22;
    if (s === CTX.FILL_1) return 0.45;
    if (s === CTX.FILL_2) return 0.7;
    if (s === CTX.FILL_3) return 0.92;
    if (s === CTX.COMPRESS) return 0.92;
    if (s === CTX.FRESH_SESSION) return 0.18;
    if (s >= CTX.RESET) return 0;
    return 0.22;
  });

  const summBufFill = $derived.by(() => {
    const s = contextStage.stageIndex;
    if (s === CTX.COMPRESS) return 0.24;
    return 0.12;
  });

  const dialogHasSummary = $derived(
    contextStage.stageIndex === CTX.FRESH_SESSION,
  );

  function isWalking(stage: number): boolean {
    return contextStage.stageIndex === stage;
  }

  // === Pinned-chart Y follows camera ===================================
  //
  // Classic "sticky rail" pattern also used by the chat segment's takeaways:
  // compute the visible world-space top, then offset a constant amount so
  // the chart sits just below the segment header in the viewport.

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const chartTopY = $derived(viewportTopY + 140);

  // === Auto-scroll to newest staged element ============================

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
    const _ = contextStage.stageIndex;
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
    const elemHeight = last.offsetHeight;
    const elemBottomWorldY = lastTopY + elemHeight;
    const vpH = camera.viewportHeight / camera.zoom;

    // Bottom anchor at 0.72 reserves clear space above the nav bar
    // that sits fixed at the bottom of the viewport. Top anchor flip
    // applies when an element is too tall to fit comfortably between
    // the two.
    const topAnchor = 0.12;
    const bottomAnchor = 0.72;
    const maxComfortableHeight = vpH * (bottomAnchor - topAnchor);

    const desiredCameraY =
      elemHeight <= maxComfortableHeight
        ? elemBottomWorldY - vpH * (bottomAnchor - 0.5)
        : lastTopY + vpH * (0.5 - topAnchor);

    const minY = vpH / 2;
    const maxY = Math.max(minY, seg.height - vpH / 2);
    const y = Math.max(minY, Math.min(maxY, desiredCameraY));

    if (Math.abs(y - camera.y) < 2) return;

    camera.scrollTo(y, {
      duration: DEFAULTS.scroll.stageScrollDuration,
      ease: DEFAULTS.scroll.stageScrollEase,
    });
  }

  // === Mode-aware scenario content =====================================
  //
  // Structure is identical between modes. Only the exemplars change:
  //   - technical thread: a Svelte todo-list component
  //   - design thread: "Plate", a recipe + meal-planning app
  //
  // The walk-through sample cards, the intro bubbles and the dialog
  // sample inside them are all driven from these variants.

  type BubbleUser = { kind: 'user'; text: string };
  type BubbleAI = { kind: 'ai'; text: string };
  type BubbleFile = { kind: 'file'; file: string; diffMark: '+' | '~'; diffHint: string };
  type Bubble = BubbleUser | BubbleAI | BubbleFile;

  const technicalBubbles: Bubble[] = [
    { kind: 'user', text: 'Build me a small todo list component in Svelte.' },
    { kind: 'ai', text: 'Simple component: input, list, add and remove.' },
    { kind: 'file', file: 'TodoList.svelte', diffMark: '+', diffHint: '+48 lines' },
    { kind: 'user', text: 'Make it persist to localStorage.' },
    { kind: 'ai', text: 'Add $effect: sync to storage on every change.' },
    { kind: 'file', file: 'TodoList.svelte', diffMark: '~', diffHint: '+12 / -3' },
  ];

  const designBubbles: Bubble[] = [
    { kind: 'user', text: 'Design the main recipe browse screen for Plate, my meal-planning app.' },
    { kind: 'ai', text: 'Card grid with filter chips up top. Hero image + cook time per card.' },
    { kind: 'file', file: 'recipe-browse.fig', diffMark: '+', diffHint: '+6 frames' },
    { kind: 'user', text: 'Make the empty state more inviting for first-time users.' },
    { kind: 'ai', text: 'Illustrated hero + quick-start CTA pointing to "Discover recipes".' },
    { kind: 'file', file: 'recipe-browse.fig', diffMark: '~', diffHint: '+2 / -1 frames' },
  ];

  const bubbles = $derived(mode.current === 'design' ? designBubbles : technicalBubbles);

  // Walk-through sample cards. Six partitions, each with title/kind/body.
  const technicalSamples = {
    system: {
      title: 'System prompt',
      kind: 'Fixed - set by the application',
      body: `You are a coding assistant.
You help with software engineering tasks by reading
code, making edits, and running commands.

Answer concisely. Follow the project's written
conventions. When a change touches multiple files,
summarise the plan before editing.`,
    },
    tools: {
      title: 'Tool definitions',
      kind: 'Fixed - declared by the harness',
      body: `• Read(file_path)        - read a file
• Edit(file, old, new)   - patch a file in place
• Write(file, content)   - overwrite a file
• Bash(command)          - run a shell command
• Grep(pattern, glob?)   - search across files
• Glob(pattern)          - list matching paths
• WebFetch(url)          - fetch and summarise`,
    },
    memory: {
      title: 'Memory file',
      kind: 'Persistent - authored by user or project',
      body: `## Project Conventions
- Keep docs in docs/ up to date.
- Log each session at its end.

## Writing Style
- No em-dashes. Use hyphens or commas.

## Git Use
- Commit frequently in small batches.`,
    },
    dialog: {
      title: 'Dialog (conversation so far)',
      kind: 'Variable - grows with every turn',
      body: `> Build a todo list component
  AI: Created TodoList.svelte with add/remove.
> Make it persist to localStorage
  AI: Added $effect to sync on every change.
> The checkbox isn't saving state
  AI: Bug was in the toggle handler - fixed.
... + 12 more turns`,
    },
    summbuf: {
      title: 'Summarisation buffer',
      kind: 'Reserved - headroom for compression',
      body: `Kept empty by default. When the dialog nears
the limit, older turns are summarised and the
summary lands here, clearing room.

Without this reserved space, the model would have
nowhere to "crunch" to once it runs out.`,
    },
    free: {
      title: 'Free space',
      kind: `Remaining - what's left to fill`,
      body: `such empty...

(Everything that still fits. Shrinks as the dialog
grows. Once it's gone, the conversation cannot
continue without compression or reset.)`,
    },
  };

  const designSamples = {
    system: {
      title: 'System prompt',
      kind: 'Fixed - set by the application',
      body: `You are a design assistant.
You help with UX, layout, and visual design work
by inspecting files, editing them, and generating
variants on request.

Keep intent clear. Match the product's design
system. Flag accessibility and edge cases before
shipping a visual change.`,
    },
    tools: {
      title: 'Tool definitions',
      kind: 'Fixed - declared by the harness',
      body: `• Read(file_path)        - read a file or frame
• Edit(file, old, new)   - patch a file in place
• Write(file, content)   - overwrite a file
• Inspect(selector)      - inspect a design element
• ApplyStyle(el, tokens) - apply tokens to an element
• SearchAssets(query)    - find in the asset library
• WebFetch(url)          - fetch and summarise`,
    },
    memory: {
      title: 'Memory file',
      kind: 'Persistent - authored by user or project',
      body: `## Project Conventions
- Design files live in figma/.
- Specs + rationale live in docs/.

## Visual Style
- 8pt spacing grid, 3 levels max hierarchy.
- Warm tones for primary, neutrals for structure.

## Components
- Use the design system. Do not invent primitives.`,
    },
    dialog: {
      title: 'Dialog (conversation so far)',
      kind: 'Variable - grows with every turn',
      body: `> Design the main recipe browse screen
  AI: Created recipe-browse.fig with the card grid.
> Make the empty state more inviting
  AI: Added illustrated hero + quick-start CTA.
> Filter chips overflow on mobile
  AI: Moved to horizontal scroll, labels still visible.
... + 12 more iterations`,
    },
    summbuf: {
      title: 'Summarisation buffer',
      kind: 'Reserved - headroom for compression',
      body: `Kept empty by default. When the dialog nears
the limit, older turns are summarised and the
summary lands here, clearing room.

Without this reserved space, the model would have
nowhere to "crunch" to once it runs out.`,
    },
    free: {
      title: 'Free space',
      kind: `Remaining - what's left to fill`,
      body: `such empty...

(Everything that still fits. Shrinks as the dialog
grows. Once it's gone, the conversation cannot
continue without compression or reset.)`,
    },
  };

  const samples = $derived(
    mode.current === 'design' ? designSamples : technicalSamples,
  );
</script>

<div
  class="ctx-root"
  class:chart-docked={chartVisible}
  bind:this={rootEl}
  data-segment-root
>
  <!-- =================================================================
       PINNED CHART - right side, invisible until morph, then tracks the
       camera so it stays in view while the left column scrolls. The
       chart itself still animates internally (block reveals, dialog
       growth, compression, reset) as stages advance.
       ================================================================= -->
  <aside
    class="chart-pinned"
    class:visible={chartVisible}
    style:transform="translateY({chartTopY}px)"
  >
    <div class="chart-frame" class:revealed={chartVisible}>
      <div class="chart-title">Context window</div>

      <div class="stack">
        <!-- SYSTEM PROMPT (top) -->
        <div
          class="block system"
          class:visible={contextStage.reveal(CTX.STACK_SYSTEM)}
          class:walking={isWalking(CTX.WALK_SYSTEM)}
          style:flex-grow="0.08"
        >
          <span class="b-label">System prompt</span>
          <span class="b-meter">fixed</span>
        </div>

        <!-- TOOLS -->
        <div
          class="block tools"
          class:visible={contextStage.reveal(CTX.STACK_TOOLS)}
          class:walking={isWalking(CTX.WALK_TOOLS)}
          style:flex-grow="0.12"
        >
          <span class="b-label">Tools</span>
          <span class="b-meter">fixed</span>
        </div>

        <!-- MEMORY -->
        <div
          class="block memory"
          class:visible={contextStage.reveal(CTX.STACK_MEMORY)}
          class:walking={isWalking(CTX.WALK_MEMORY)}
          style:flex-grow="0.05"
        >
          <span class="b-label">Memory file</span>
          <span class="b-meter">persistent</span>
        </div>

        <!-- DIALOG -->
        <div
          class="block dialog"
          class:visible={afterMorph}
          class:walking={isWalking(CTX.WALK_DIALOG)}
          class:morphing={contextStage.stageIndex === CTX.MORPH_TO_DIALOG}
          class:compressing
          class:emptied={reset}
          style:flex-grow={Math.max(0.02, dialogFill)}
        >
          {#if dialogHasSummary}
            <div class="summary-band" aria-hidden="true">
              <span class="sb-tag">Summary of prior turns</span>
            </div>
          {/if}

          <span class="b-label">Dialog</span>
          <span class="b-meter">{#if reset}wiped{:else if dialogHasSummary}summary loaded{:else}{Math.round(dialogFill * 100)}%{/if}</span>

          <div class="density">
            {#each Array(Math.round(dialogFill * 14)) as _, i (i)}
              <span class="tick" style:--i={i}></span>
            {/each}
          </div>
        </div>

        <!-- FREE SPACE -->
        <div
          class="block free"
          class:visible={contextStage.reveal(CTX.STACK_FREE)}
          class:walking={isWalking(CTX.WALK_FREE)}
          class:dim={inFillup && contextStage.stageIndex >= CTX.FILL_3}
          style:flex-grow={Math.max(
            0.05,
            1 - dialogFill - summBufFill - 0.25,
          )}
        >
          <span class="b-label">Free space</span>
          <span class="b-meter">{Math.round(Math.max(5, (1 - dialogFill - summBufFill - 0.25) * 100))}%</span>
        </div>

        <!-- SUMMARISATION BUFFER (bottom) -->
        <div
          class="block summbuf"
          class:visible={contextStage.reveal(CTX.STACK_SUMMBUF)}
          class:walking={isWalking(CTX.WALK_SUMMBUF)}
          class:compressing
          style:flex-grow={summBufFill}
        >
          <span class="b-label">Summarisation buffer</span>
          <span class="b-meter">{#if compressing}receiving…{:else}reserved{/if}</span>

          {#if compressing}
            <div class="compress-arrow" aria-hidden="true">
              <div class="compress-head"></div>
            </div>
          {/if}
        </div>
      </div>

      {#if contextStage.stageIndex === CTX.MORPH_TO_DIALOG}
        <div class="morph-glow"></div>
      {/if}
    </div>
  </aside>

  <!-- =================================================================
       SCROLLING COLUMN - header + every stage's callout accumulates
       here. Centred until the chart docks, then shifts left.
       ================================================================= -->
  <header class="segment-header">
    <span class="eyebrow">Under the hood</span>
    <h1 class="headline-gradient">From prompt to context</h1>
    <p class="subhead">
      How the model's working memory is assembled, filled, and cleared.
    </p>
  </header>

  <div class="ctx-column">
    <!-- Phase 1: dialog builds from individual bubbles. Data-driven so the
         same template renders both the technical (todo-list) and the
         design ("Plate" recipe app) threads. Stages 1-6 map to the six
         entries in the bubbles array. ---------------------------------- -->
    {#each bubbles as bubble, i (i)}
      {#if contextStage.reveal(i + 1)}
        {#if bubble.kind === 'user'}
          <div class="message user" data-staged="true">
            <div class="bubble">{bubble.text}</div>
          </div>
        {:else if bubble.kind === 'ai'}
          <div class="message ai" data-staged="true">
            <div class="avatar">AI</div>
            <div class="bubble think">
              <span class="tag"><span class="pulse"></span> Thinking</span>
              <em>{bubble.text}</em>
            </div>
          </div>
        {:else}
          <div class="message ai" data-staged="true">
            <div class="avatar file-av">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div class="bubble file-bubble">
              <span class="file-line"><span class="diff-mark" class:add={bubble.diffMark === '+'} class:mod={bubble.diffMark === '~'}>{bubble.diffMark}</span> {bubble.file}</span>
              <span class="diff-hint">{bubble.diffHint}</span>
            </div>
          </div>
        {/if}
      {/if}
    {/each}

    <!-- Phase 2: morph callout ------------------------------------------ -->
    {#if contextStage.reveal(CTX.MORPH_TO_DIALOG)}
      <div class="callout" data-staged="true">
        <div class="co-label">The dialog block</div>
        <p class="co-body">
          Every prompt, thought and file change we just saw is packaged
          together as the <strong>Dialog</strong> - one piece of what the
          model actually reads.
        </p>
      </div>
    {/if}

    <!-- Phase 3: overview callout when the stacking chart starts filling - -->
    {#if contextStage.reveal(CTX.STACK_SYSTEM)}
      <div class="callout accent" data-staged="true">
        <div class="co-label">The full picture</div>
        <p class="co-body">
          A turn of dialog is only one slice of what the model reads.
          The other blocks are always there, quietly framing every
          reply. Let's walk each one.
        </p>
      </div>
    {/if}

    <!-- Phase 4: partition explainer cards. One per walkthrough stage.
         Each card stays in the scroll once revealed. -------------------- -->
    {#if contextStage.reveal(CTX.WALK_SYSTEM)}
      <div
        class="sample-card"
        data-staged="true"
        class:active={isWalking(CTX.WALK_SYSTEM)}
      >
        <div class="sc-kind">{samples.system.kind}</div>
        <div class="sc-title">{samples.system.title}</div>
        <pre class="sc-body"><code>{samples.system.body}</code></pre>
      </div>
    {/if}

    {#if contextStage.reveal(CTX.WALK_TOOLS)}
      <div
        class="sample-card"
        data-staged="true"
        class:active={isWalking(CTX.WALK_TOOLS)}
      >
        <div class="sc-kind">{samples.tools.kind}</div>
        <div class="sc-title">{samples.tools.title}</div>
        <pre class="sc-body"><code>{samples.tools.body}</code></pre>
      </div>
    {/if}

    {#if contextStage.reveal(CTX.WALK_MEMORY)}
      <div
        class="sample-card"
        data-staged="true"
        class:active={isWalking(CTX.WALK_MEMORY)}
      >
        <div class="sc-kind">{samples.memory.kind}</div>
        <div class="sc-title">{samples.memory.title}</div>
        <pre class="sc-body"><code>{samples.memory.body}</code></pre>
      </div>
    {/if}

    {#if contextStage.reveal(CTX.WALK_DIALOG)}
      <div
        class="sample-card"
        data-staged="true"
        class:active={isWalking(CTX.WALK_DIALOG)}
      >
        <div class="sc-kind">{samples.dialog.kind}</div>
        <div class="sc-title">{samples.dialog.title}</div>
        <pre class="sc-body"><code>{samples.dialog.body}</code></pre>
      </div>
    {/if}

    {#if contextStage.reveal(CTX.WALK_SUMMBUF)}
      <div
        class="sample-card"
        data-staged="true"
        class:active={isWalking(CTX.WALK_SUMMBUF)}
      >
        <div class="sc-kind">{samples.summbuf.kind}</div>
        <div class="sc-title">{samples.summbuf.title}</div>
        <pre class="sc-body"><code>{samples.summbuf.body}</code></pre>
      </div>
    {/if}

    {#if contextStage.reveal(CTX.WALK_FREE)}
      <div
        class="sample-card"
        data-staged="true"
        class:active={isWalking(CTX.WALK_FREE)}
      >
        <div class="sc-kind">{samples.free.kind}</div>
        <div class="sc-title">{samples.free.title}</div>
        <pre class="sc-body"><code>{samples.free.body}</code></pre>
      </div>
    {/if}

    <!-- Phase 5: fill-up callout (watch the chart grow) ----------------- -->
    {#if contextStage.reveal(CTX.FILL_1)}
      <div class="callout warn" data-staged="true">
        <div class="co-label">It fills up</div>
        <p class="co-body">
          Every prompt, thought and file change adds tokens to the dialog.
          The rest of the stack stays put, so free space is what gives
          way. Watch the chart →
        </p>
      </div>
    {/if}

    <!-- Phase 6: compression ------------------------------------------- -->
    {#if contextStage.reveal(CTX.COMPRESS)}
      <div class="callout warn" data-staged="true">
        <div class="co-label">Compression</div>
        <p class="co-body">
          The older turns are summarised. The summary is generated into
          the reserved buffer - that's what the headroom is for.
        </p>
      </div>
    {/if}

    <!-- Phase 6b: fresh session ---------------------------------------- -->
    {#if contextStage.reveal(CTX.FRESH_SESSION)}
      <div class="callout accent" data-staged="true">
        <div class="co-label">Fresh session</div>
        <p class="co-body">
          The summary is now the top of the dialog. The original turns
          are gone, the buffer is reserved again, and there's room to
          keep going.
        </p>
      </div>
    {/if}

    <!-- Phase 7: session reset ---------------------------------------- -->
    {#if contextStage.reveal(CTX.RESET)}
      <div class="callout danger" data-staged="true">
        <div class="co-label">Session reset</div>
        <p class="co-body">
          Sometimes a session goes off track. A reset wipes the dialog
          entirely while leaving the system prompt, tools and memory in
          place. Clean slate, same agent.
        </p>
      </div>
    {/if}

    <!-- Phase 8: closing takeaways - a small "Takeaways" heading followed
         by numbered lines. No card, just the same typographic treatment
         the other segments use on their takeaway rails. ------------------ -->
    {#if contextStage.reveal(CTX.TAKEAWAY_1)}
      <div class="takeaways-heading" data-staged="true">Takeaways</div>
    {/if}

    {#if contextStage.reveal(CTX.TAKEAWAY_1)}
      <div class="takeaway-row" data-staged="true">
        <span class="tr-index">01</span>
        <span class="tr-text">{takeaways[0]}</span>
      </div>
    {/if}

    {#if contextStage.reveal(CTX.TAKEAWAY_2)}
      <div class="takeaway-row" data-staged="true">
        <span class="tr-index">02</span>
        <span class="tr-text">{takeaways[1]}</span>
      </div>
    {/if}

    {#if contextStage.reveal(CTX.TAKEAWAY_3)}
      <div class="takeaway-row" data-staged="true">
        <span class="tr-index">03</span>
        <span class="tr-text">{takeaways[2]}</span>
      </div>
    {/if}

    {#if contextStage.reveal(CTX.TAKEAWAY_4)}
      <div class="takeaway-row" data-staged="true">
        <span class="tr-index">04</span>
        <span class="tr-text">{takeaways[3]}</span>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  /* === Root ============================================================= */

  .ctx-root {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 120px 0 180px 0;
  }

  /* === Header + scrolling column - same pattern as chat/LLM segments. */

  .segment-header {
    width: min(820px, 100%);
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

  .ctx-column {
    width: min(820px, 100%);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 26px;
  }

  /* The scrolling column sits centred while the chart is hidden (stages
     1-6). Once the chart docks (stage 7+) the column shifts left so the
     pinned chart has room on the right. */
  .ctx-root .segment-header,
  .ctx-root .ctx-column {
    transition: transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .ctx-root.chart-docked .segment-header,
  .ctx-root.chart-docked .ctx-column {
    transform: translateX(-320px);
  }

  /* === Messages - same visual language as chat segment. =============== */

  .message {
    display: flex;
    gap: 18px;
    animation: fade-in 0.35s ease-out;
  }

  .message.user {
    justify-content: flex-end;
  }

  .message.ai {
    align-items: flex-start;
  }

  .avatar {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--gradient-accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.04em;
    margin-top: 3px;
  }

  .avatar.file-av {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--color-border-strong);
    color: var(--color-text-muted);
  }

  .bubble {
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text);
    border: 1px solid rgba(255, 255, 255, 0.09);
    padding: 16px 24px;
    border-radius: 24px 24px 8px 24px;
    max-width: 680px;
    font-size: 26px;
    line-height: 1.45;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .message.ai .bubble {
    border-radius: 24px 24px 24px 8px;
  }

  .bubble .tag {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .bubble em {
    font-style: italic;
    color: var(--color-text-muted);
  }

  .bubble.think {
    background: rgba(168, 85, 247, 0.1);
    border-color: var(--color-tool-border);
  }

  .pulse {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--color-ai-mid);
    box-shadow: 0 0 0 0 var(--color-ai-mid);
    animation: pulse 1.6s ease-in-out infinite;
  }

  .bubble.file-bubble {
    background: rgba(0, 0, 0, 0.35);
    border-color: var(--color-border-strong);
    font-family: var(--font-mono);
    font-size: 21px;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .file-line {
    color: var(--color-text);
  }

  .diff-mark {
    display: inline-block;
    width: 1em;
    text-align: center;
    font-weight: 700;
  }
  .diff-mark.add {
    color: var(--color-success);
  }
  .diff-mark.mod {
    color: var(--color-ai-end);
  }

  .diff-hint {
    margin-left: auto;
    color: var(--color-text-subtle);
    font-size: 17px;
    letter-spacing: 0.05em;
  }

  /* === Callouts - used for morph, fill-up, compression, reset, etc. === */

  .callout {
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-md);
    padding: 22px 28px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: fade-in 0.4s ease-out;
  }

  .callout.accent {
    border-color: var(--color-tool-border);
    background: rgba(168, 85, 247, 0.08);
  }

  .callout.warn {
    border-color: rgba(245, 158, 11, 0.3);
    background: rgba(245, 158, 11, 0.06);
  }

  .callout.danger {
    border-color: rgba(248, 113, 113, 0.3);
    background: rgba(248, 113, 113, 0.06);
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
  .callout.warn .co-label {
    color: var(--color-ai-end);
  }
  .callout.danger .co-label {
    color: var(--color-error);
  }

  .co-body {
    margin: 0;
    font-size: 24px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .co-body strong {
    color: var(--color-ai-mid);
    font-weight: 600;
  }

  /* === Sample cards - one per partition in the walk-through. They
         accumulate in the scroll. The currently-walked one pulses so the
         eye knows which chart block it maps to. =========================== */

  .sample-card {
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    animation: fade-in 0.4s ease-out;
    transition:
      border-color 0.4s ease,
      box-shadow 0.4s ease,
      background 0.4s ease;
  }

  .sample-card.active {
    border-color: rgba(236, 72, 153, 0.55);
    background: rgba(168, 85, 247, 0.1);
    box-shadow:
      0 0 0 1px rgba(236, 72, 153, 0.25),
      0 24px 64px -24px rgba(168, 85, 247, 0.4);
  }

  .sc-kind {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    margin-bottom: 10px;
  }

  .sc-title {
    font-size: 34px;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.1;
    background: var(--gradient-headline);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 18px;
  }

  .sc-body {
    font-family: var(--font-mono);
    font-size: 20px;
    line-height: 1.55;
    color: var(--color-text);
    background: rgba(0, 0, 0, 0.35);
    padding: 18px 22px;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-code-border);
    white-space: pre-wrap;
    margin: 0;
  }

  /* === Takeaways - plain numbered rows. Same treatment as the takeaways
     rail in the other segments, just rendered inline in the scroll. No
     card, no background, just gray label + white body on the segment bg. */

  .takeaways-heading {
    font-family: var(--font-mono);
    font-size: 22px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border);
    margin-top: 20px;
    animation: fade-in 0.45s ease-out;
  }

  .takeaway-row {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 22px;
    align-items: baseline;
    animation: fade-in 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .tr-index {
    font-family: var(--font-mono);
    font-size: 22px;
    color: var(--color-text-subtle);
    letter-spacing: 0.1em;
  }

  .tr-text {
    font-size: 30px;
    line-height: 1.4;
    color: var(--color-text);
    font-weight: 400;
  }

  .tail-spacer {
    height: 320px;
  }

  /* ====================================================================
     PINNED CHART
     The entire chart-pinned <aside> is positioned absolute within the
     segment and moved each frame via inline transform to track the
     camera. That keeps it visually anchored to the viewport's upper-
     right while the left column scrolls.
     ==================================================================== */

  .chart-pinned {
    position: absolute;
    top: 0;
    /* Parked slightly off to the right of the visual centre until docked. */
    left: 1150px;
    width: 500px;
    height: 780px;
    pointer-events: none;
    opacity: 0;
    transition:
      opacity 0.55s ease,
      left 0.75s cubic-bezier(0.22, 1, 0.36, 1);
    z-index: 2;
  }

  .chart-pinned.visible {
    opacity: 1;
    left: 1320px;
    pointer-events: auto;
  }

  .chart-frame {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 28px 32px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-xl);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(0, 0, 0, 0.2)),
      var(--color-surface);
    display: flex;
    flex-direction: column;
    gap: 18px;
    transition: box-shadow 0.6s ease;
  }

  .chart-frame.revealed {
    box-shadow:
      0 40px 120px -40px rgba(168, 85, 247, 0.28),
      inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  }

  .chart-title {
    font-family: var(--font-mono);
    font-size: 22px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    text-align: center;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--color-border);
  }

  .stack {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 0;
  }

  .block {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
    padding: 0 22px;
    border-radius: 10px;
    min-height: 0;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--color-border);
    opacity: 0;
    transform: scaleY(0.4);
    transform-origin: center;
    transition:
      opacity 0.45s ease,
      transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
      flex-grow 0.7s cubic-bezier(0.22, 1, 0.36, 1),
      background 0.4s ease,
      border-color 0.4s ease,
      box-shadow 0.4s ease;
    overflow: hidden;
  }

  .block.visible {
    opacity: 1;
    transform: scaleY(1);
  }

  .block.summbuf.compressing {
    overflow: visible;
  }

  .block.walking {
    background: rgba(168, 85, 247, 0.18);
    border-color: rgba(236, 72, 153, 0.55);
    box-shadow:
      0 0 0 1px rgba(236, 72, 153, 0.25),
      0 0 36px 0 rgba(236, 72, 153, 0.2);
  }

  .b-label {
    font-family: var(--font-mono);
    font-size: 22px;
    letter-spacing: 0.02em;
    color: var(--color-text);
    white-space: nowrap;
    flex: 0 0 auto;
  }

  .b-meter {
    font-family: var(--font-mono);
    font-size: 17px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    white-space: nowrap;
    flex: 0 0 auto;
    text-align: right;
  }

  .block.system {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.25);
  }
  .block.tools {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.28);
  }
  .block.memory {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.28);
  }

  .block.dialog {
    background: linear-gradient(
      180deg,
      rgba(168, 85, 247, 0.22),
      rgba(236, 72, 153, 0.12)
    );
    border-color: rgba(236, 72, 153, 0.35);
  }

  .block.dialog.morphing {
    animation: morph-pulse 0.9s ease-out;
  }

  .block.dialog.compressing {
    animation: crunch 1.1s ease-in-out;
  }

  .block.dialog.emptied {
    background: rgba(255, 255, 255, 0.02);
    border-color: var(--color-border);
  }

  .block.summbuf {
    background: rgba(250, 204, 21, 0.08);
    border-color: rgba(250, 204, 21, 0.28);
    border-style: dashed;
  }

  .block.summbuf.compressing {
    background: rgba(250, 204, 21, 0.25);
    border-style: solid;
    animation: catch 1.1s ease-out;
  }

  .block.free {
    background: rgba(255, 255, 255, 0.015);
    border-color: var(--color-border);
    border-style: dashed;
  }

  .block.free.dim {
    background: rgba(248, 113, 113, 0.06);
    border-color: rgba(248, 113, 113, 0.35);
  }

  .summary-band {
    position: absolute;
    top: 6px;
    left: 6px;
    right: 6px;
    height: 28px;
    display: flex;
    align-items: center;
    padding: 0 14px;
    border-radius: 8px;
    background: rgba(250, 204, 21, 0.22);
    border: 1px solid rgba(250, 204, 21, 0.45);
    pointer-events: none;
  }

  .sb-tag {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(250, 204, 21, 0.95);
    white-space: nowrap;
  }

  .density {
    position: absolute;
    left: 22px;
    right: 22px;
    bottom: 14px;
    height: 7px;
    display: flex;
    gap: 4px;
    pointer-events: none;
  }

  .tick {
    flex: 1;
    background: rgba(255, 255, 255, 0.55);
    border-radius: 3px;
    animation: tick-in 0.35s ease-out both;
    animation-delay: calc(var(--i) * 40ms);
  }

  /* --- compression arrow ---------------------------------------------- */

  .compress-arrow {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 10px);
    width: 12px;
    height: 170px;
    transform: translateX(-50%);
    pointer-events: none;
    animation: compress-flow 1.2s ease-in-out infinite;
  }

  .compress-arrow::before {
    content: '';
    position: absolute;
    inset: 0 0 18px 0;
    border-radius: 5px;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(250, 204, 21, 0.35) 25%,
      rgba(250, 204, 21, 1) 100%
    );
  }

  .compress-head {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 17px solid transparent;
    border-right: 17px solid transparent;
    border-top: 22px solid rgba(250, 204, 21, 1);
    filter: drop-shadow(0 0 12px rgba(250, 204, 21, 0.55));
  }

  /* --- morph glow ------------------------------------------------------ */

  .morph-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      circle at 50% 60%,
      rgba(236, 72, 153, 0.28),
      transparent 55%
    );
    animation: glow-pulse 0.9s ease-out;
  }

  /* === Animations ======================================================= */

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

  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4);
    }
    50% {
      box-shadow: 0 0 0 5px rgba(236, 72, 153, 0);
    }
  }

  @keyframes morph-pulse {
    0% {
      transform: scaleY(0.6);
      filter: brightness(1.5);
    }
    60% {
      transform: scaleY(1.04);
    }
    100% {
      transform: scaleY(1);
      filter: brightness(1);
    }
  }

  @keyframes glow-pulse {
    0% {
      opacity: 0;
    }
    40% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes crunch {
    0% {
      transform: scaleX(1);
    }
    40% {
      transform: scaleX(0.88);
      filter: saturate(1.6);
    }
    100% {
      transform: scaleX(1);
      filter: saturate(1);
    }
  }

  @keyframes catch {
    0% {
      transform: scaleY(1);
    }
    50% {
      transform: scaleY(1.08);
      box-shadow: 0 0 48px 0 rgba(250, 204, 21, 0.4);
    }
    100% {
      transform: scaleY(1);
    }
  }

  @keyframes compress-flow {
    0% {
      opacity: 0;
      transform: translate(-50%, -20px);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate(-50%, 30px);
    }
  }

  @keyframes tick-in {
    from {
      opacity: 0;
      transform: scaleX(0);
    }
    to {
      opacity: 1;
      transform: scaleX(1);
    }
  }
</style>
