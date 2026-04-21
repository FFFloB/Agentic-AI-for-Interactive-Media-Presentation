<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { ctxEngStage } from './stage.svelte';
  import { mode } from '$content/mode.svelte';

  let { segmentId = 'context-engineering' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, ctxEngStage));
  onDestroy(() => unregisterStage(segmentId));

  // === Takeaways rail - identical pattern to chat/LLM segments. ==========

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    { at: 3, text: 'The craft is no longer writing one perfect prompt. It is curating everything the agent reads across a session.' },
    { at: 6, text: 'The memory file is the entry point. From there it links out to the docs, roadmaps and guides the agent actually needs.' },
    { at: 8, text: 'Human and agent work from the same files. That is what makes AI co-creation transparent and traceable.' },
  ];

  const takeawaysActive = $derived(ctxEngStage.reveal(takeaways[0].at));

  // Auto-scroll to newest staged element.
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
    const _ = ctxEngStage.stageIndex;
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

  // === Mode-aware scenario content =====================================
  //
  // Structure is identical between modes. Only the exemplars change:
  //   - technical: engineering-centric paradigm + docs + style guide
  //   - design:    design-centric paradigm + docs + design-system guide
  //
  // The four filenames listed in memory.md / the shared-truth diagram /
  // the linked-docs row also pivot based on mode, so the third file reads
  // as either "architecture" (technical) or "design-system" (design).

  type LinkedDoc = { name: string; blurb: string };
  type Content = {
    // Stage 2 - "old craft" prompt example (over-engineered prompt)
    oldPrompt: string;
    // Stage 4 - memory.md body. {link1..4} tokens get replaced in the
    // template with pulsing spans.
    memoryLinks: [string, string, string, string];
    // Stage 6 - three linked-doc cards
    linkedDocs: LinkedDoc[];
    // Stage 7 - the focused file that gets loaded on demand
    focused: {
      name: string;
      body: string;
      foot: string;
    };
    // Stage 8 - filenames listed in the shared-truth diagram
    sharedFiles: string[];
  };

  const technicalContent: Content = {
    oldPrompt: `You are an expert developer. Think step
by step. Respond ONLY with valid JSON
matching this schema. Before you answer,
consider: 1) edge cases 2) security
3) performance. Do not include prose…`,
    memoryLinks: [
      'docs/project_info.md',
      'docs/roadmap.md',
      'docs/architecture.md',
      'docs/style-guide.md',
    ],
    linkedDocs: [
      { name: 'roadmap.md', blurb: 'What we are building, in what order, and why. Milestone plan.' },
      { name: 'architecture.md', blurb: 'Module layout, data flow, boundaries. Updated when it changes.' },
      { name: 'style-guide.md', blurb: 'Naming, formatting, voice. What "good" looks like in this repo.' },
    ],
    focused: {
      name: 'docs/style-guide.md',
      body: `# Style guide

## Voice
- First-person plural when describing decisions.
- Avoid hype words ("revolutionary", "powerful").

## Naming
- Files: kebab-case. Types: PascalCase.
- Booleans read as questions: \`isLoading\`, \`hasChanges\`.

## Comments
- Explain WHY, not WHAT. Default to none.`,
      foot: `The agent pulls this in only when it matters - writing new code, reviewing a PR, drafting copy. The rest of the time it stays out of the way.`,
    },
    sharedFiles: ['memory.md', 'roadmap.md', 'architecture.md', 'style-guide.md'],
  };

  const designContent: Content = {
    oldPrompt: `You are an expert designer. Think step
by step. Respect the 8pt grid and the
brand tokens. Before you output, consider:
1) accessibility 2) empty / loading / error
states 3) mobile responsiveness. Return ONLY
Figma-compatible JSON, no prose…`,
    memoryLinks: [
      'docs/project_info.md',
      'docs/roadmap.md',
      'docs/design-system.md',
      'docs/style-guide.md',
    ],
    linkedDocs: [
      { name: 'roadmap.md', blurb: 'What we are shipping, in what order, and why. Feature + launch plan.' },
      { name: 'design-system.md', blurb: 'Tokens, components, patterns. The shared visual language of the product.' },
      { name: 'style-guide.md', blurb: 'Voice, tone, spacing, type. What "on brand" means in practice.' },
    ],
    focused: {
      name: 'docs/design-system.md',
      body: `# Design system

## Tokens
- Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
- Type scale: 12 / 14 / 16 / 20 / 24 / 32 / 48
- Radius: 4 / 8 / 12 / 16 / full

## Components
- Compose from the system. Do not invent primitives.
- Variants use state names: hover, active, disabled.

## Voice
- Warm, direct, no hype.`,
      foot: `The agent pulls this in when it matters - drafting a new screen, proposing a component, reviewing a flow. The rest of the time it stays out of the way.`,
    },
    sharedFiles: ['memory.md', 'roadmap.md', 'design-system.md', 'style-guide.md'],
  };

  const content = $derived(
    mode.current === 'design' ? designContent : technicalContent,
  );
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
        <li class="takeaway" class:shown={ctxEngStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">The craft is shifting</span>
    <h1 class="headline-gradient">From prompt engineering to context engineering</h1>
    <p class="subhead">
      The real lever is not the single prompt. It is everything the agent
      reads before it answers - and whether you and it are reading the
      same thing.
    </p>
  </header>

  <div class="cx-column">
    <!-- Stage 1 - framing question in the user's voice -->
    {#if ctxEngStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          People keep saying "prompt engineering is dead, it is all context
          engineering now". What does that actually mean?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - the old paradigm, with an example of prompt-crafting -->
    {#if ctxEngStage.reveal(2)}
      <div class="paradigm old" data-staged="true">
        <div class="p-kicker">Old craft</div>
        <div class="p-title">Prompt engineering</div>
        <div class="p-sub">
          One message. Write it carefully. Hope the model follows.
        </div>
        <pre class="p-example"><code>{content.oldPrompt}</code></pre>
      </div>
    {/if}

    <!-- Stage 3 - the shift [TAKEAWAY 1] -->
    {#if ctxEngStage.reveal(3)}
      <div class="paradigm new" data-staged="true">
        <div class="p-kicker">New craft</div>
        <div class="p-title">Context engineering</div>
        <div class="p-sub">
          Hundreds of turns. Dozens of files. The game is curating
          <em>what the agent sees</em> across the whole session, not a
          single magic sentence.
        </div>
        <div class="p-pillars">
          <div class="p-pill"><span class="pp-num">01</span> Memory file</div>
          <div class="p-pill"><span class="pp-num">02</span> Linked docs</div>
          <div class="p-pill"><span class="pp-num">03</span> Working files</div>
        </div>
      </div>
    {/if}

    <!-- Stage 4 - the memory file, auto-loaded at session start -->
    {#if ctxEngStage.reveal(4)}
      <div class="file-card" data-staged="true">
        <div class="fc-header">
          <span class="fc-icon">md</span>
          <span class="fc-name">memory.md</span>
          <span class="fc-status">auto-loaded · every session</span>
        </div>
        <pre class="fc-body"><code># Project conventions

- Docs live in <span class="fc-link" class:pulsing={ctxEngStage.reveal(5)}>{content.memoryLinks[0]}</span>
- Milestone plan: <span class="fc-link" class:pulsing={ctxEngStage.reveal(5)}>{content.memoryLinks[1]}</span>
- {mode.current === 'design' ? 'Design system' : 'Module layout'}: <span class="fc-link" class:pulsing={ctxEngStage.reveal(5)}>{content.memoryLinks[2]}</span>
- Style + voice: <span class="fc-link" class:pulsing={ctxEngStage.reveal(5)}>{content.memoryLinks[3]}</span>

## Writing style
- Short sentences. No em-dashes.
- When in doubt, check the style guide.

## {mode.current === 'design' ? 'Design system' : 'Git'}
- {mode.current === 'design' ? 'Use tokens. Never hard-code values.' : 'Small, scoped commits. Tag co-authors.'}</code></pre>
      </div>
    {/if}

    <!-- Stage 5 - explain the links (note, not a new card - stage 5 activates
         the pulsing highlight on the link tokens already shown in stage 4) -->
    {#if ctxEngStage.reveal(5)}
      <div class="callout" data-staged="true">
        <span class="c-dot"></span>
        <span class="c-text">
          The highlighted tokens above are paths to other files. The agent
          can follow any of them the moment it needs the detail.
        </span>
      </div>
    {/if}

    <!-- Stage 6 - linked docs appear as connected cards [TAKEAWAY 2] -->
    {#if ctxEngStage.reveal(6)}
      <div class="linked-docs" data-staged="true">
        {#each content.linkedDocs as doc, i (doc.name)}
          <div class="doc-card" style:--i={i}>
            <div class="dc-head">
              <span class="dc-icon">md</span>
              <span class="dc-name">{doc.name}</span>
            </div>
            <p class="dc-blurb">{doc.blurb}</p>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Stage 7 - the agent follows a link, zoom-in on one doc -->
    {#if ctxEngStage.reveal(7)}
      <div class="file-card focused" data-staged="true">
        <div class="fc-header">
          <span class="fc-icon">md</span>
          <span class="fc-name">{content.focused.name}</span>
          <span class="fc-status">loaded on demand</span>
        </div>
        <pre class="fc-body"><code>{content.focused.body}</code></pre>
        <div class="fc-foot">{content.focused.foot}</div>
      </div>
    {/if}

    <!-- Stage 8 - shared-truth visual [TAKEAWAY 3] -->
    {#if ctxEngStage.reveal(8)}
      <div class="shared-truth" data-staged="true">
        <div class="st-head">
          <span class="st-label">Shared truth</span>
          <span class="st-sub">One set of files. Two readers. Same page.</span>
        </div>
        <div class="st-diagram">
          <div class="st-actor human">
            <div class="st-avatar">HU</div>
            <div class="st-name">You</div>
            <div class="st-role">Writes + maintains</div>
          </div>
          <div class="st-middle">
            <div class="st-arrow left">→</div>
            <div class="st-files">
              {#each content.sharedFiles as f (f)}
                <div class="st-file">{f}</div>
              {/each}
            </div>
            <div class="st-arrow right">←</div>
          </div>
          <div class="st-actor agent">
            <div class="st-avatar ai">AI</div>
            <div class="st-name">The agent</div>
            <div class="st-role">Reads + follows</div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stage 9 - closing emphasis -->
    {#if ctxEngStage.reveal(9)}
      <div class="closer" data-staged="true">
        <div class="cl-row">
          <span class="cl-badge">Transparency</span>
          <span class="cl-text">
            Every rule the agent follows is a file you can open and edit.
          </span>
        </div>
        <div class="cl-row">
          <span class="cl-badge">Traceability</span>
          <span class="cl-text">
            If the agent does something, you can point to the sentence
            that told it to.
          </span>
        </div>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  /* === Layout + header - same family as chat / LLM segments. =========== */

  .cx-root {
    width: 100%;
    height: 100%;
    padding: 120px 0 180px 0;
    position: relative;
  }

  .segment-header {
    width: min(900px, 100%);
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
    font-size: 84px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.1;
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
    width: min(900px, 100%);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  /* === Message bubble - reused from chat segment. ===================== */

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

  /* === Paradigm cards (old vs new) - paired cards contrasting the two
         crafts. Old is muted; new gets the AI accent treatment. ========= */

  .paradigm {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 28px 32px;
    animation: fade-in 0.45s ease-out;
  }

  .paradigm.old {
    background: rgba(255, 255, 255, 0.02);
  }

  .paradigm.new {
    background:
      linear-gradient(180deg, rgba(168, 85, 247, 0.14), rgba(236, 72, 153, 0.04)),
      rgba(0, 0, 0, 0.2);
    border-color: var(--color-tool-border);
    box-shadow: 0 24px 64px -24px rgba(168, 85, 247, 0.32);
  }

  .p-kicker {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .paradigm.new .p-kicker {
    color: var(--color-ai-mid);
  }

  .p-title {
    font-family: var(--font-sans);
    font-size: 46px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-top: 6px;
    color: var(--color-text);
  }

  .paradigm.new .p-title {
    background: var(--gradient-headline);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .p-sub {
    margin-top: 14px;
    font-size: 24px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .p-sub em {
    font-style: normal;
    color: var(--color-text);
    background: rgba(236, 72, 153, 0.14);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .p-example {
    margin-top: 20px;
    padding: 18px 20px;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid var(--color-code-border);
    border-radius: 8px;
    font-family: var(--font-mono);
    font-size: 19px;
    line-height: 1.55;
    color: var(--color-text-muted);
    white-space: pre;
    overflow-x: auto;
  }

  .p-pillars {
    display: flex;
    gap: 14px;
    margin-top: 22px;
    flex-wrap: wrap;
  }

  .p-pill {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 10px 18px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--color-border-strong);
    border-radius: 9999px;
    font-size: 20px;
    color: var(--color-text);
  }

  .pp-num {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.14em;
    color: var(--color-ai-mid);
  }

  /* === File card - shows a single file's content with a header. Re-used
         for both memory.md (stage 4) and style-guide.md (stage 7). ===== */

  .file-card {
    border: 1px solid var(--color-tool-border);
    background: var(--color-tool-bg);
    border-radius: var(--radius-md);
    overflow: hidden;
    animation: fade-in 0.45s ease-out;
  }

  .file-card.focused {
    box-shadow:
      0 0 0 1px rgba(236, 72, 153, 0.25),
      0 24px 64px -16px rgba(168, 85, 247, 0.35);
  }

  .fc-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 22px;
    border-bottom: 1px solid var(--color-border);
    font-family: var(--font-mono);
    font-size: 18px;
    letter-spacing: 0.04em;
  }

  .fc-icon {
    font-size: 14px;
    font-weight: 600;
    padding: 5px 10px;
    border-radius: 6px;
    background: var(--gradient-accent);
    color: white;
    letter-spacing: 0.04em;
  }

  .fc-name {
    color: var(--color-text);
    font-weight: 500;
  }

  .fc-status {
    margin-left: auto;
    color: var(--color-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 14px;
  }

  .fc-body {
    font-family: var(--font-mono);
    font-size: 21px;
    line-height: 1.6;
    color: var(--color-text);
    background: var(--color-code-bg);
    padding: 22px 26px;
    margin: 0;
    white-space: pre;
    overflow-x: auto;
  }

  .fc-body code {
    font-family: inherit;
  }

  .fc-link {
    color: var(--color-ai-mid);
    border-bottom: 1px solid rgba(236, 72, 153, 0.35);
    padding-bottom: 1px;
    transition: all 0.3s ease;
  }

  .fc-link.pulsing {
    background: rgba(236, 72, 153, 0.14);
    border-radius: 4px;
    padding: 1px 6px;
    border-bottom: none;
    box-shadow: 0 0 0 1px rgba(236, 72, 153, 0.4);
    animation: link-pulse 1.8s ease-in-out infinite;
  }

  .fc-foot {
    padding: 16px 22px 22px;
    border-top: 1px solid var(--color-border);
    font-size: 20px;
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  /* === Callout (stage 5) - small inline explainer row. =============== */

  .callout {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    padding: 16px 22px;
    margin-left: 24px;
    background: rgba(168, 85, 247, 0.08);
    border: 1px solid var(--color-tool-border);
    border-radius: 12px;
    font-size: 22px;
    color: var(--color-text-muted);
    line-height: 1.45;
    animation: fade-in 0.4s ease-out;
  }

  .c-dot {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-ai-mid);
    margin-top: 9px;
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.5);
    animation: pulse 1.6s ease-in-out infinite;
  }

  /* === Linked docs - three cards shown side-by-side, each staggering in. */

  .linked-docs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .doc-card {
    padding: 20px 22px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    opacity: 0;
    transform: translateY(12px);
    animation: doc-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(var(--i) * 0.14s);
  }

  .dc-head {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 19px;
    margin-bottom: 12px;
  }

  .dc-icon {
    font-size: 12px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 5px;
    background: rgba(168, 85, 247, 0.35);
    color: white;
    letter-spacing: 0.04em;
  }

  .dc-name {
    color: var(--color-text);
  }

  .dc-blurb {
    font-size: 19px;
    line-height: 1.45;
    color: var(--color-text-muted);
    margin: 0;
  }

  /* === Shared truth diagram (stage 8). Horizontal: human, central files,
         agent. Arrows point inward so the files read as the hub. ========= */

  .shared-truth {
    padding: 32px 36px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    animation: fade-in 0.5s ease-out;
  }

  .st-head {
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .st-label {
    font-family: var(--font-mono);
    font-size: 17px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  .st-sub {
    font-size: 28px;
    line-height: 1.3;
    color: var(--color-text);
    font-weight: 500;
  }

  .st-diagram {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: 20px;
    align-items: center;
  }

  .st-actor {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .st-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--color-human);
    color: #071;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .st-avatar.ai {
    background: var(--gradient-accent);
    color: white;
  }

  .st-name {
    font-size: 22px;
    font-weight: 500;
    color: var(--color-text);
  }

  .st-role {
    font-size: 16px;
    color: var(--color-text-subtle);
    font-family: var(--font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .st-middle {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 16px;
  }

  .st-arrow {
    font-size: 36px;
    color: var(--color-ai-mid);
    font-weight: 300;
  }

  .st-files {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 18px;
    background: rgba(168, 85, 247, 0.08);
    border: 1px solid var(--color-tool-border);
    border-radius: 12px;
    box-shadow: 0 0 0 1px rgba(236, 72, 153, 0.15);
  }

  .st-file {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--color-text);
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
  }

  /* === Closer card - final two-beat statement. ======================= */

  .closer {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 28px 32px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.02);
    animation: fade-in 0.45s ease-out;
  }

  .cl-row {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 22px;
    align-items: baseline;
  }

  .cl-badge {
    font-family: var(--font-mono);
    font-size: 16px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
    padding: 8px 14px;
    background: rgba(236, 72, 153, 0.12);
    border: 1px solid rgba(236, 72, 153, 0.3);
    border-radius: 9999px;
    text-align: center;
  }

  .cl-text {
    font-size: 26px;
    line-height: 1.45;
    color: var(--color-text);
  }

  /* === Takeaways rail - identical to chat/LLM. ====================== */

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

  @keyframes doc-in {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes link-pulse {
    0%,
    100% {
      box-shadow: 0 0 0 1px rgba(236, 72, 153, 0.4);
    }
    50% {
      box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.0);
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
