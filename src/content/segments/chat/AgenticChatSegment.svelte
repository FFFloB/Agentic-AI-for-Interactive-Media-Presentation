<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { walkthrough } from '$lib/walkthrough/walkthrough.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { chatStage } from './stage.svelte';

  let { segmentId = 'agentic-chat' }: { segmentId?: string } = $props();

  // Derive the currently spotlighted zoom-target id from the presentation script.
  // When the current step is a spotlight on this segment, that target id lights up.
  const highlightedId = $derived.by(() => {
    const step = walkthrough.currentStep;
    if (step?.type === 'spotlight' && step.segmentId === segmentId) {
      return step.targetId;
    }
    return null;
  });

  // === Takeaways rail (camera-tracking overlay in the right column) ===
  //
  // Segment is 1920 wide. When takeaways arrive we shift the chat column left
  // and pin the takeaways to the right so the pair sits centered on the page.

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  // Takeaways - each tied to the stage it becomes true at.
  const takeaways = [
    { at: 4, text: 'LLMs have embedded knowledge and intuition that can fail even on simple tasks.' },
    { at: 6, text: 'Thinking enables LLMs to reason with itself to reach more robust results.' },
    { at: 8, text: "Tools are functions that LLMs can 'call' to execute actions on demand, including writing of code." },
    { at: 17, text: 'Tools can greatly improve LLMs abilities and access to up-to-date online information.' },
    { at: 19, text: 'Web tools keep track of the used external sources.' },
  ];

  // Active once the first takeaway is due. Drives the two-column layout shift.
  const takeawaysActive = $derived(chatStage.reveal(takeaways[0].at));

  let rootEl: HTMLDivElement;
  let pythonRunCard: HTMLDivElement | null = $state(null);
  let errorFixCard: HTMLDivElement | null = $state(null);
  let validationCard: HTMLDivElement | null = $state(null);
  let searchResultsEl: HTMLDivElement | null = $state(null);
  let sourceExcerptEl: HTMLDivElement | null = $state(null);
  let thinkingOneEl: HTMLDivElement | null = $state(null);
  let thinkingTwoEl: HTMLDivElement | null = $state(null);

  onMount(() => {
    registerStage(segmentId, chatStage);
  });
  onDestroy(() => {
    unregisterStage(segmentId);
  });

  // Walk the offsetParent chain up to rootEl, accumulating offsets. Needed
  // because any ancestor with a CSS transform becomes an offsetParent, which
  // would otherwise make offsetTop/offsetLeft relative to that ancestor, not
  // to the segment root.
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

  function measure(el: HTMLElement | null) {
    if (!el || !rootEl) return;
    const { x, y } = offsetWithin(el, rootEl);
    return {
      xOffset: x,
      yOffset: y,
      width: el.offsetWidth,
      height: el.offsetHeight,
    };
  }

  // Register / re-measure zoom targets any time the stage changes and DOM settles.
  $effect(() => {
    const _ = chatStage.stageIndex;
    tick().then(() => {
      const t1 = measure(pythonRunCard);
      if (t1) chatStage.registerRect('python-run', t1);
      const t2 = measure(errorFixCard);
      if (t2) chatStage.registerRect('python-fix', t2);
      const t3 = measure(validationCard);
      if (t3) chatStage.registerRect('python-validation', t3);
      const t4 = measure(searchResultsEl);
      if (t4) chatStage.registerRect('search-results', t4);
      const t5 = measure(sourceExcerptEl);
      if (t5) chatStage.registerRect('source-excerpt', t5);
      const t6 = measure(thinkingOneEl);
      if (t6) chatStage.registerRect('thinking-one', t6);
      const t7 = measure(thinkingTwoEl);
      if (t7) chatStage.registerRect('thinking-two', t7);
    });
  });

  // Auto-scroll: when stage changes, if the latest element is below the
  // visible viewport, animate camera.y so the newest content anchors near
  // the bottom of the viewport.
  $effect(() => {
    const _ = chatStage.stageIndex;
    tick().then(() => autoScrollToLatest());
  });

  function autoScrollToLatest() {
    if (!rootEl) return;
    const seg = segments.get(segmentId);
    if (!seg) return;

    // Find the last currently-rendered staged node.
    const staged = rootEl.querySelectorAll<HTMLElement>('[data-staged="true"]');
    const last = staged[staged.length - 1];
    if (!last) return;

    const { y: lastTopY } = offsetWithin(last, rootEl);
    const elemBottomWorldY = lastTopY + last.offsetHeight;
    const viewportWorldHeight = camera.viewportHeight / camera.zoom;

    // Anchor: newest bottom at ~85% down the viewport.
    const anchor = 0.85;
    const desiredCameraY = elemBottomWorldY - viewportWorldHeight * (anchor - 0.5);

    // Clamp: camera.y can't show above segment top or below segment bottom.
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

{#snippet spotlightBadge(name: string)}
  <div class="spotlight-badge">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
    <span class="sb-label">Tool use</span>
    <span class="sb-sep">·</span>
    <span class="sb-name">{name}</span>
  </div>
{/snippet}

{#snippet sourceBadge(host: string)}
  <div class="spotlight-badge source">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
    <span class="sb-label">Source</span>
    <span class="sb-sep">·</span>
    <span class="sb-name">{host}</span>
  </div>
{/snippet}

<div
  class="chat-root"
  class:two-col={takeawaysActive}
  bind:this={rootEl}
  data-segment-root
>
  <!-- Right rail: takeaways revealed alongside the staged content -->
  <aside
    class="right-rail"
    class:visible={takeawaysActive}
    style:transform="translateY({railTopY}px)"
  >
    <div class="rr-label" class:visible={takeawaysActive}>Takeaways</div>
    <ol class="takeaways">
      {#each takeaways as item, i (item.at)}
        <li class="takeaway" class:shown={chatStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">The shift</span>
    <h1 class="headline-gradient">From chatbot to agent</h1>
    <p class="subhead">
      What changes when a language model can think, write and run code,
      and reach for tools on its own.
    </p>
  </header>

  <div class="chat-column">
    <!-- Part 1: the chatbot baseline -->
    {#if chatStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">Hey! Quick question for you.</div>
      </div>
    {/if}

    {#if chatStage.reveal(2)}
      <div class="message ai" data-staged="true">
        <div class="avatar">AI</div>
        <div class="body">Of course - what's on your mind?</div>
      </div>
    {/if}

    {#if chatStage.reveal(3)}
      <div class="message user" data-staged="true">
        <div class="bubble">How many "A"s are in the word <code>banana</code>?</div>
      </div>
    {/if}

    {#if chatStage.reveal(4)}
      <div class="message ai" data-staged="true">
        <div class="avatar">AI</div>
        <div class="body" class:struck={chatStage.reveal(5)}>
          The word <em>banana</em> has exactly <strong>2</strong> "A"s. Hope that helps!
        </div>
      </div>
    {/if}

    {#if chatStage.reveal(5)}
      <div class="revise-note" data-staged="true">
        <span class="dot"></span>
        Hold on - let me actually work that out.
      </div>
    {/if}

    <!-- Part 2: agentic thinking + Python tool -->
    {#if chatStage.reveal(6)}
      <div
        class="thinking"
        data-staged="true"
        data-zoom-target="thinking-one"
        bind:this={thinkingOneEl}
      >
        <div class="thinking-header">
          <span class="pulse"></span>
          Thinking
        </div>
        <div class="thinking-body">
          <p class="thought">
            The user wants a count of a letter in a short string. That's a
            mechanical task. I shouldn't answer from intuition - I'll write a
            small script and actually run it.
          </p>
          {#if chatStage.reveal(7)}
            <p class="thought">
              I'll treat the check as case-insensitive - "A" in casual English
              usually means any <em>a</em>. I'll reach for the Python sandbox.
            </p>
          {/if}
        </div>
      </div>
    {/if}

    {#if chatStage.reveal(8)}
      <div
        class="tool-call"
        class:errored={chatStage.reveal(9) && !chatStage.reveal(10)}
        class:spotlighted={highlightedId === 'python-run'}
        data-staged="true"
        data-zoom-target="python-run"
        bind:this={pythonRunCard}
      >
        {#if highlightedId === 'python-run'}
          {@render spotlightBadge('python')}
        {/if}
        <div class="tool-header">
          <span class="tool-icon">py</span>
          <span class="tool-name">python</span>
          <span class="tool-status">
            {#if chatStage.reveal(9) && !chatStage.reveal(10)}
              error
            {:else if !chatStage.reveal(9)}
              running…
            {:else}
              completed
            {/if}
          </span>
        </div>
        <pre class="code"><code>count = banana.count('A')
print(count)</code></pre>
        {#if chatStage.reveal(9)}
          <div class="tool-output error">
            <span class="output-label">stderr</span>
            <pre><code>Traceback (most recent call last):
  File "&lt;sandbox&gt;", line 1, in &lt;module&gt;
NameError: name 'banana' is not defined</code></pre>
          </div>
        {/if}
      </div>
    {/if}

    {#if chatStage.reveal(10)}
      <div
        class="tool-call"
        class:spotlighted={highlightedId === 'python-fix'}
        data-staged="true"
        data-zoom-target="python-fix"
        bind:this={errorFixCard}
      >
        {#if highlightedId === 'python-fix'}
          {@render spotlightBadge('python')}
        {/if}
        <div class="tool-header">
          <span class="tool-icon">py</span>
          <span class="tool-name">python</span>
          <span class="tool-status">completed</span>
        </div>
        <div class="tool-note">
          Missed defining the input. Binding <code>word</code> and folding case before counting.
        </div>
        <pre class="code"><code>def count_a(s: str) -&gt; int:
    return s.lower().count('a')

print(count_a('banana'))</code></pre>
        <div class="tool-output">
          <span class="output-label">stdout</span>
          <pre><code>3</code></pre>
        </div>
      </div>
    {/if}

    {#if chatStage.reveal(11)}
      <div
        class="tool-call"
        class:spotlighted={highlightedId === 'python-validation'}
        data-staged="true"
        data-zoom-target="python-validation"
        bind:this={validationCard}
      >
        {#if highlightedId === 'python-validation'}
          {@render spotlightBadge('python')}
        {/if}
        <div class="tool-header">
          <span class="tool-icon">py</span>
          <span class="tool-name">python</span>
          <span class="tool-status">completed</span>
        </div>
        <div class="tool-note">
          Sanity-checking against strings whose counts I already know.
        </div>
        <pre class="code"><code>assert count_a('AAA') == 3
assert count_a('Alabama') == 4
assert count_a('') == 0
print('validated')</code></pre>
        <div class="tool-output">
          <span class="output-label">stdout</span>
          <pre><code>validated</code></pre>
        </div>
      </div>
    {/if}

    {#if chatStage.reveal(12)}
      <div class="summary-line" data-staged="true">
        Running the validated function on <code>"banana"</code> returns <strong>3</strong>.
      </div>
    {/if}

    {#if chatStage.reveal(13)}
      <div class="message ai" data-staged="true">
        <div class="avatar">AI</div>
        <div class="body">
          I checked by writing a quick script: there are <strong>3</strong> "a"s
          in <em>banana</em> (case-insensitive).
        </div>
      </div>
    {/if}

    <!-- Part 4: live-data demo -->
    {#if chatStage.reveal(14)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          How many bananas have been shipped world-wide in 2026?
        </div>
      </div>
    {/if}

    {#if chatStage.reveal(15)}
      <div class="message ai" data-staged="true">
        <div class="avatar">AI</div>
        <div class="body" class:struck={chatStage.reveal(16)}>
          Based on what I know, around <strong>18 million tons</strong> were
          exported in 2024 - I don't have reliable data past my training cut-off.
        </div>
      </div>
    {/if}

    {#if chatStage.reveal(16)}
      <div
        class="thinking"
        data-staged="true"
        data-zoom-target="thinking-two"
        bind:this={thinkingTwoEl}
      >
        <div class="thinking-header">
          <span class="pulse"></span>
          Thinking - with web access
        </div>
        <div class="thinking-body">
          <p class="thought">
            This is a live-data question. I should not guess from training data -
            reach for <code>web_search</code> and compile a cited answer.
          </p>
        </div>
      </div>
    {/if}

    {#if chatStage.reveal(17)}
      <div
        class="tool-call search"
        class:spotlighted={highlightedId === 'search-results'}
        data-staged="true"
        data-zoom-target="search-results"
        bind:this={searchResultsEl}
      >
        {#if highlightedId === 'search-results'}
          {@render spotlightBadge('web_search')}
        {/if}
        <div class="tool-header">
          <span class="tool-icon">web</span>
          <span class="tool-name">web_search</span>
          <span class="tool-status">completed</span>
        </div>
        <ul class="search-queries">
          <li><span class="q-verb">q:</span> global banana exports 2026</li>
          <li><span class="q-verb">q:</span> FAO banana production 2026 report</li>
          <li><span class="q-verb">q:</span> banana shipping volume 2026 tonnes</li>
        </ul>
        <ul class="search-results">
          <li>
            <div class="sr-host">fao.org</div>
            <div class="sr-title">World banana statistics overview - 2026 update</div>
            <div class="sr-excerpt">
              Global banana exports in 2026 reached an estimated 20.4 million
              tonnes, up 3.2% year-on-year…
            </div>
          </li>
          <li>
            <div class="sr-host">statista.com</div>
            <div class="sr-title">Banana production worldwide 2010-2026</div>
            <div class="sr-excerpt">
              Production surpassed 125 million tonnes in 2026, with Ecuador and
              the Philippines leading exporters…
            </div>
          </li>
          <li>
            <div class="sr-host">reuters.com</div>
            <div class="sr-title">Banana supply chain: record shipping year in 2026</div>
            <div class="sr-excerpt">
              Container data from major ports shows ~20 million tonnes moved
              internationally in 2026, a post-pandemic high…
            </div>
          </li>
        </ul>
      </div>
    {/if}

    {#if chatStage.reveal(18)}
      <div
        class="source-excerpt"
        class:spotlighted={highlightedId === 'source-excerpt'}
        data-staged="true"
        data-zoom-target="source-excerpt"
        bind:this={sourceExcerptEl}
      >
        {#if highlightedId === 'source-excerpt'}
          {@render sourceBadge('fao.org')}
        {/if}
        <div class="se-host">fao.org  ·  World banana statistics 2026</div>
        <blockquote>
          "Global banana exports reached an estimated 20.4 million tonnes in
          2026, up from 19.8 million tonnes in 2025. Ecuador remained the
          largest exporter with a 28% share, followed by the Philippines and
          Costa Rica."
        </blockquote>
      </div>
    {/if}

    {#if chatStage.reveal(19)}
      <div class="message ai" data-staged="true">
        <div class="avatar">AI</div>
        <div class="body">
          Roughly <strong>20.4 million tonnes</strong> of bananas were exported
          internationally in 2026 - up from 19.8 Mt in 2025. Ecuador,
          the Philippines and Costa Rica lead.
          <span class="cites">
            <span class="cite">fao.org</span>
            <span class="cite">statista.com</span>
            <span class="cite">reuters.com</span>
          </span>
        </div>
      </div>
    {/if}

    <!-- Spacer so the last message doesn't stick to segment bottom -->
    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  .chat-root {
    width: 100%;
    height: 100%;
    padding: 120px 0 180px 0;
    position: relative;
  }

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

  .chat-column {
    width: min(820px, 100%);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 26px;
  }

  /* --- messages --- */

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
    padding: 20px 26px;
    border-radius: 24px 24px 8px 24px;
    max-width: 78%;
    font-size: 26px;
    line-height: 1.5;
  }

  .bubble code {
    background: rgba(0, 0, 0, 0.35);
    padding: 1px 6px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 0.92em;
    color: var(--color-text);
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

  .body {
    flex: 1;
    font-size: 26px;
    line-height: 1.55;
    color: var(--color-text);
    padding-top: 6px;
  }

  .body em {
    font-style: normal;
    color: var(--color-text-muted);
  }

  .body.struck {
    text-decoration: line-through;
    text-decoration-color: rgba(248, 113, 113, 0.65);
    text-decoration-thickness: 2px;
    color: var(--color-text-subtle);
    transition: all 0.3s ease;
  }

  .cites {
    display: inline-flex;
    gap: 6px;
    margin-left: 8px;
    vertical-align: middle;
  }

  .cite {
    font-size: 17px;
    padding: 3px 12px;
    border-radius: 9999px;
    background: var(--color-ai-soft);
    border: 1px solid var(--color-tool-border);
    color: var(--color-text-muted);
    font-family: var(--font-mono);
  }

  /* --- revise note --- */

  .revise-note {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    color: var(--color-text-muted);
    padding: 8px 20px;
    background: rgba(248, 113, 113, 0.08);
    border: 1px solid rgba(248, 113, 113, 0.22);
    border-radius: 9999px;
    margin-left: 66px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-error);
  }

  /* --- thinking --- */

  .thinking {
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-md);
    padding: 26px 30px;
    margin-left: 66px;
  }

  .thinking-header {
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: var(--font-mono);
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-text-subtle);
    margin-bottom: 18px;
  }

  .pulse {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--color-ai-mid);
    box-shadow: 0 0 0 0 var(--color-ai-mid);
    animation: pulse 1.6s ease-in-out infinite;
  }

  .thinking-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .thought {
    font-size: 23px;
    line-height: 1.55;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .thought code {
    font-style: normal;
    background: rgba(255, 255, 255, 0.05);
    padding: 1px 6px;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: 0.92em;
  }

  /* --- tool call --- */

  .tool-call {
    position: relative;
    margin-left: 66px;
    border: 1px solid var(--color-tool-border);
    background: var(--color-tool-bg);
    border-radius: var(--radius-md);
    overflow: hidden;
    transition:
      box-shadow 0.45s ease,
      border-color 0.45s ease,
      background 0.45s ease;
  }

  .tool-call.errored {
    border-color: rgba(248, 113, 113, 0.35);
    background: rgba(248, 113, 113, 0.05);
  }

  .tool-call.spotlighted {
    border-color: rgba(236, 72, 153, 0.55);
    background: rgba(168, 85, 247, 0.14);
    box-shadow:
      0 0 0 1px rgba(236, 72, 153, 0.25),
      0 24px 64px -16px rgba(168, 85, 247, 0.45),
      0 0 56px 0 rgba(236, 72, 153, 0.18);
  }

  .spotlight-badge {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 22px;
    background: var(--gradient-accent);
    color: white;
    font-family: var(--font-mono);
    font-size: 17px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(255, 255, 255, 0.14);
    animation: badge-in 0.35s ease-out;
  }

  .spotlight-badge svg {
    flex-shrink: 0;
  }

  .sb-sep {
    opacity: 0.55;
  }

  .sb-name {
    text-transform: lowercase;
    letter-spacing: 0.04em;
    font-weight: 500;
  }

  @keyframes badge-in {
    from {
      opacity: 0;
      max-height: 0;
    }
    to {
      opacity: 1;
      max-height: 72px;
    }
  }

  .tool-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 22px;
    border-bottom: 1px solid var(--color-border);
    font-family: var(--font-mono);
    font-size: 18px;
    letter-spacing: 0.04em;
  }

  .tool-icon {
    font-size: 15px;
    font-weight: 600;
    padding: 5px 11px;
    border-radius: 6px;
    background: var(--gradient-accent);
    color: white;
    letter-spacing: 0.04em;
  }

  .tool-name {
    color: var(--color-text);
    font-weight: 500;
  }

  .tool-status {
    margin-left: auto;
    color: var(--color-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 15px;
  }

  .tool-note {
    padding: 18px 22px 0;
    font-size: 21px;
    color: var(--color-text-muted);
  }

  .tool-note code {
    font-family: var(--font-mono);
    font-size: 0.9em;
    background: rgba(0, 0, 0, 0.25);
    padding: 1px 6px;
    border-radius: 4px;
  }

  .code,
  pre {
    font-family: var(--font-mono);
    font-size: 21px;
    line-height: 1.55;
    background: var(--color-code-bg);
    border-top: 1px solid var(--color-code-border);
    padding: 20px 22px;
    overflow-x: auto;
    color: var(--color-text);
    margin: 18px 0 0;
    white-space: pre;
  }

  .code code {
    font-family: inherit;
  }

  .tool-output {
    padding: 14px 22px 20px;
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tool-output.error {
    background: rgba(248, 113, 113, 0.06);
  }

  .tool-output pre {
    margin: 0;
    padding: 14px 16px;
    border: none;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    font-size: 20px;
    color: var(--color-text-muted);
  }

  .tool-output.error pre {
    color: var(--color-error);
  }

  .output-label {
    font-family: var(--font-mono);
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--color-text-subtle);
  }

  /* --- summary --- */

  .summary-line {
    margin-left: 66px;
    font-size: 21px;
    color: var(--color-text-muted);
    font-family: var(--font-mono);
  }

  .summary-line code {
    background: rgba(0, 0, 0, 0.25);
    padding: 1px 6px;
    border-radius: 4px;
  }

  /* --- search + sources --- */

  .search-queries {
    list-style: none;
    padding: 20px 22px 6px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 20px;
    color: var(--color-text-muted);
  }

  .q-verb {
    color: var(--color-ai-mid);
    margin-right: 8px;
  }

  .search-results {
    list-style: none;
    padding: 12px 22px 22px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .search-results li {
    padding: 18px 20px;
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
  }

  .sr-host {
    font-family: var(--font-mono);
    font-size: 17px;
    color: var(--color-text-subtle);
    text-transform: lowercase;
    letter-spacing: 0.04em;
  }

  .sr-title {
    font-size: 23px;
    font-weight: 500;
    margin-top: 3px;
    color: var(--color-text);
  }

  .sr-excerpt {
    font-size: 20px;
    color: var(--color-text-muted);
    margin-top: 6px;
    line-height: 1.45;
  }

  .source-excerpt {
    position: relative;
    margin-left: 66px;
    border: 1px solid var(--color-border);
    border-left: 4px solid var(--color-ai-mid);
    background: rgba(255, 255, 255, 0.02);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
    padding: 20px 30px;
    transition:
      box-shadow 0.45s ease,
      border-color 0.45s ease,
      background 0.45s ease;
  }

  .source-excerpt.spotlighted {
    border-color: rgba(236, 72, 153, 0.55);
    border-left-color: var(--color-ai-mid);
    background: rgba(168, 85, 247, 0.12);
    box-shadow:
      0 0 0 1px rgba(236, 72, 153, 0.25),
      0 24px 64px -16px rgba(168, 85, 247, 0.45),
      0 0 56px 0 rgba(236, 72, 153, 0.18);
  }

  .source-excerpt .spotlight-badge.source {
    display: inline-flex;
    margin-bottom: 14px;
    border-bottom: none;
    border-radius: 9999px;
    padding: 6px 14px;
    font-size: 15px;
  }

  .se-host {
    font-family: var(--font-mono);
    font-size: 17px;
    color: var(--color-text-subtle);
    margin-bottom: 12px;
  }

  blockquote {
    font-size: 24px;
    line-height: 1.55;
    color: var(--color-text);
    font-style: italic;
  }

  .tail-spacer {
    height: 240px;
  }

  /* --- two-column shift ---
     Default: chat column centered in the segment.
     Once takeaways arrive: chat column nudges left, takeaways slide in on the right.
     Together they read as a balanced pair centered on the page. */

  .chat-root .segment-header,
  .chat-root .chat-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .chat-root.two-col .segment-header,
  .chat-root.two-col .chat-column {
    transform: translateX(-300px);
  }

  /* --- takeaways rail --- */

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
    transition:
      opacity 0.5s ease,
      transform 0.5s ease;
    will-change: opacity, transform;
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
    font-weight: 400;
  }

  .takeaway.shown .t-text {
    color: var(--color-text);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(8px);
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
      box-shadow: 0 0 0 6px rgba(236, 72, 153, 0);
    }
  }
</style>
