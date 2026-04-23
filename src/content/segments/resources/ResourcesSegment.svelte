<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { resourcesStage } from './stage.svelte';

  // Logo assets imported as modules so Vite processes them. For the
  // single-file build they get base64-inlined; for the normal build
  // they stay as separate hashed files. Either way, resolved at
  // build time rather than fetched from /logos/.
  import vscodeLogoUrl from '../../../assets/logos/vscode.png';
  import gitLogoUrl from '../../../assets/logos/git.png';
  import obsidianLogoUrl from '../../../assets/logos/obsidian.svg';

  let { segmentId = 'resources' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, resourcesStage));
  onDestroy(() => unregisterStage(segmentId));

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    { at: 2, text: 'York has an AI policy. Read it before your next assessed submission.' },
    { at: 3, text: 'Three free tools that let you run agentic work with real control: a code-first editor, version control, and a linked-notes vault.' },
    { at: 4, text: 'The repo for this talk is public. Learn from the process, not just the output.' },
  ];
  const takeawaysActive = $derived(resourcesStage.reveal(takeaways[0].at));

  // University of York student hub for AI in assessment (entry page;
  // routes to the Acceptable Assistance policy, the taught-student
  // guidance, and the library's practical guide).
  const YORK_POLICY_URL = 'https://www.york.ac.uk/students/studying/assessment-and-examination/ai/';
  const REPO_URL = 'https://github.com/FFFloB/Agentic-AI-for-Interactive-Media-Presentation';

  // Logos sourced from official brand pages:
  // - VS Code: https://code.visualstudio.com/brand (PNG download)
  // - Git: https://git-scm.com/community/logos (PNG download, CC BY 3.0 to Jason Long)
  // - Obsidian: https://obsidian.md/brand (official SVG)
  const tools = [
    {
      id: 'vscode',
      name: 'VS Code',
      url: 'https://code.visualstudio.com/',
      logo: vscodeLogoUrl,
      role: 'Not just for coding. For any agentic work, VS Code gives you more control over what the agent sees, remembers, and edits than most chat-first tools. Context engineering with your hands on the wheel.',
    },
    {
      id: 'git',
      name: 'Git',
      url: 'https://git-scm.com/',
      logo: gitLogoUrl,
      role: 'Version control. When an agentic run goes sideways - and it will - Git lets you roll back to a known-good state, branch off, and try a different path without losing what worked.',
    },
    {
      id: 'obsidian',
      name: 'Obsidian',
      url: 'https://obsidian.md/',
      logo: obsidianLogoUrl,
      role: 'Local knowledge management. Build, link, and curate the shared docs and memory files that make agentic work reliable. Plain markdown, yours forever, no lock-in.',
    },
  ];

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
    const _ = resourcesStage.stageIndex;
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
    const topAnchor = 0.12;
    const bottomAnchor = 0.85;
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
</script>

<div
  class="rs-root"
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
        <li class="takeaway" class:shown={resourcesStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Appendix · Useful resources</span>
    <h1 class="headline-gradient">Where to go from here</h1>
    <p class="subhead">
      The policy that applies to your assessed work, three free tools
      that make agentic work reliable, and the open repo where this
      whole talk was built. All links clickable.
    </p>
  </header>

  <div class="rs-column">
    <!-- Stage 1 - framing -->
    {#if resourcesStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          Where should I actually start?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - York AI policy [TAKEAWAY 1] -->
    {#if resourcesStage.reveal(2)}
      <a
        class="policy-card"
        data-staged="true"
        href={YORK_POLICY_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="pc-head">
          <span class="pc-badge">University policy</span>
          <span class="pc-cta">Open →</span>
        </div>
        <div class="pc-title">University of York: AI in assessed work</div>
        <p class="pc-body">
          The policy that governs how you can use AI in your
          coursework. Module briefs override. Read it before your
          next submission, and every time the rules feel unclear.
        </p>
      </a>
    {/if}

    <!-- Stage 3 - three tools grid [TAKEAWAY 2] -->
    {#if resourcesStage.reveal(3)}
      <div class="tools-card" data-staged="true">
        <div class="tc-head">
          <span class="tc-badge">Tools I use every day</span>
          <span class="tc-title">Three free tools for agentic work with real control.</span>
        </div>
        <div class="tc-grid">
          {#each tools as tool, i (tool.id)}
            <a
              class="tool"
              data-tool={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              style:--i={i}
            >
              <div class="tool-logo">
                <img src={tool.logo} alt="{tool.name} logo" width="56" height="56" />
              </div>
              <div class="tool-body">
                <div class="tool-name">
                  {tool.name}
                  <span class="tool-arrow" aria-hidden="true">↗</span>
                </div>
                <p class="tool-role">{tool.role}</p>
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Stage 4 - public repo [TAKEAWAY 3] -->
    {#if resourcesStage.reveal(4)}
      <a
        class="repo-card"
        data-staged="true"
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="rc-head">
          <span class="rc-badge">The code for this talk</span>
          <span class="rc-cta">Open on GitHub →</span>
        </div>
        <div class="rc-title">Browse the public repo.</div>
        <p class="rc-body">
          Every session audit, every decision, every line of code
          that built this talk is public. Fork it, steal from it,
          read it to see how the work actually happened - not just
          what came out of it.
        </p>
        <div class="rc-url">{REPO_URL.replace('https://', '')}</div>
      </a>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  .rs-root {
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
    font-size: 96px;
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

  .rs-column {
    width: min(900px, 100%);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  /* Framing bubble */
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

  /* === Policy card (York) =========================================== */

  .policy-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 26px 30px;
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    text-decoration: none;
    color: inherit;
    animation: fade-in 0.5s ease-out;
    transition:
      transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.25s ease,
      background 0.25s ease,
      box-shadow 0.25s ease;
  }

  .policy-card:hover {
    transform: translateY(-2px);
    border-color: var(--color-tool-border);
    background: rgba(168, 85, 247, 0.06);
    box-shadow: 0 20px 48px -24px rgba(168, 85, 247, 0.35);
  }

  .pc-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color-border);
    gap: 14px;
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

  .pc-cta {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  .pc-title {
    font-family: var(--font-sans);
    font-size: 30px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--color-text);
  }

  .pc-body {
    margin: 0;
    font-size: 21px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  /* === Tools card (three tools grid) ================================= */

  .tools-card {
    padding: 28px 32px;
    border: 1px solid var(--color-border-strong);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    animation: fade-in 0.55s ease-out;
  }

  .tc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    margin-bottom: 20px;
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
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.25;
    color: var(--color-text);
  }

  .tc-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .tool {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px 22px;
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    text-decoration: none;
    color: inherit;
    opacity: 0;
    transform: translateY(8px);
    animation: tool-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(var(--i) * 0.12s);
    transition:
      transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.25s ease,
      background 0.25s ease,
      box-shadow 0.25s ease;
  }

  .tool:hover {
    transform: translateY(-3px);
    border-color: var(--color-tool-border);
    background: rgba(168, 85, 247, 0.06);
    box-shadow: 0 20px 48px -24px rgba(168, 85, 247, 0.35);
  }

  .tool[data-tool='vscode']:hover {
    border-color: rgba(0, 120, 212, 0.5);
    box-shadow: 0 20px 48px -24px rgba(0, 120, 212, 0.45);
  }
  .tool[data-tool='git']:hover {
    border-color: rgba(240, 80, 50, 0.5);
    box-shadow: 0 20px 48px -24px rgba(240, 80, 50, 0.45);
  }
  .tool[data-tool='obsidian']:hover {
    border-color: rgba(158, 107, 232, 0.55);
    box-shadow: 0 20px 48px -24px rgba(158, 107, 232, 0.45);
  }

  .tool-logo {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tool-logo img {
    width: 56px;
    height: 56px;
    object-fit: contain;
    display: block;
  }

  .tool-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tool-name {
    font-family: var(--font-sans);
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .tool-arrow {
    font-size: 18px;
    color: var(--color-text-subtle);
    transition: transform 0.25s ease, color 0.25s ease;
  }

  .tool:hover .tool-arrow {
    transform: translate(2px, -2px);
    color: var(--color-ai-mid);
  }

  .tool-role {
    margin: 0;
    font-size: 18px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  /* === Repo card ===================================================== */

  .repo-card {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 32px 36px;
    border: 1px solid var(--color-tool-border);
    background:
      linear-gradient(180deg, rgba(168, 85, 247, 0.12), rgba(236, 72, 153, 0.04)),
      rgba(0, 0, 0, 0.22);
    border-radius: var(--radius-lg);
    text-decoration: none;
    color: inherit;
    animation: fade-in 0.55s ease-out;
    box-shadow: 0 24px 64px -24px rgba(168, 85, 247, 0.35);
    transition:
      transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.25s ease,
      box-shadow 0.25s ease;
  }

  .repo-card:hover {
    transform: translateY(-2px);
    border-color: rgba(236, 72, 153, 0.6);
    box-shadow: 0 28px 72px -24px rgba(236, 72, 153, 0.55);
  }

  .rc-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--color-border);
    gap: 14px;
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

  .rc-cta {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  .rc-title {
    font-family: var(--font-sans);
    font-size: 34px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--color-text);
  }

  .rc-body {
    margin: 0;
    font-size: 22px;
    line-height: 1.55;
    color: var(--color-text);
  }

  .rc-url {
    margin-top: 6px;
    padding: 12px 16px;
    background: var(--color-code-bg);
    border: 1px solid var(--color-code-border);
    border-radius: 8px;
    font-family: var(--font-mono);
    font-size: 16px;
    color: var(--color-ai-mid);
    letter-spacing: 0.02em;
    word-break: break-all;
  }

  /* === Takeaways rail (shared) ======================================= */

  .tail-spacer {
    height: 240px;
  }

  .rs-root .segment-header,
  .rs-root .rs-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .rs-root.two-col .segment-header,
  .rs-root.two-col .rs-column {
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

  @keyframes tool-in {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
