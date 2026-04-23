<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { keyLearningsStage } from './stage.svelte';

  let { segmentId = 'key-learnings' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, keyLearningsStage));
  onDestroy(() => unregisterStage(segmentId));

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  const takeaways = [
    { at: 2, text: 'Leadership: direction, vision, and judgement matter more than fine-grained skill. Learn to be in charge.' },
    { at: 3, text: 'Delegation: if you cannot explain it to a stranger, you cannot delegate it. Be articulate, precise, specific.' },
    { at: 4, text: 'Information management: treat your docs, memory, and shared understanding like gold. They are.' },
    { at: 5, text: 'These travel anywhere - a team, a classroom, a friendship, a family. Get good at them here. Carry them out.' },
  ];
  const takeawaysActive = $derived(keyLearningsStage.reveal(takeaways[0].at));

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
    const _ = keyLearningsStage.stageIndex;
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
  class="kl-root"
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
        <li class="takeaway" class:shown={keyLearningsStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Closing · Your takeaways</span>
    <h1 class="headline-gradient">Key Takeaways</h1>
    <p class="subhead">
      The three skills that make agentic AI work. Get good at these
      and the tool becomes a collaborator instead of a chore.
    </p>
  </header>

  <div class="kl-column">
    <!-- Stage 1 - framing -->
    {#if keyLearningsStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          What should I actually take away from all this?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - Leadership [TAKEAWAY 1] -->
    {#if keyLearningsStage.reveal(2)}
      <div class="skill-card" data-staged="true" data-tone="lead">
        <div class="sk-num">01</div>
        <div class="sk-body">
          <div class="sk-tag">Leadership</div>
          <div class="sk-title">Being in charge of the work.</div>
          <p class="sk-text">
            Directing the agent is directing a team. You set the
            vision. You pick the direction. You decide what good
            looks like and when it is done. You step in when things
            drift. Fine-grained technical or design skill matters
            less than it used to - ambition, lived experience, and
            the confidence to say what matters, matter more.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 3 - Delegation [TAKEAWAY 2] -->
    {#if keyLearningsStage.reveal(3)}
      <div class="skill-card" data-staged="true" data-tone="delegate">
        <div class="sk-num">02</div>
        <div class="sk-body">
          <div class="sk-tag">Delegation</div>
          <div class="sk-title">Explaining work to someone who does not share your head.</div>
          <p class="sk-text">
            Every prompt is a conversation with a fresh colleague you
            have just met. No shared context, no memory of last week,
            no guess at what you actually want. If you cannot explain
            the work clearly, precisely, and in the right order, you
            do not get it. Learn to articulate. Be specific. Say what
            "done" looks like. Invite pushback.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 4 - Information management [TAKEAWAY 3] -->
    {#if keyLearningsStage.reveal(4)}
      <div class="skill-card" data-staged="true" data-tone="info">
        <div class="sk-num">03</div>
        <div class="sk-body">
          <div class="sk-tag">Information management</div>
          <div class="sk-title">Building and keeping the shared brain.</div>
          <p class="sk-text">
            The docs you write, the memory files, the session logs,
            the decisions you capture - these are not bureaucracy.
            They are the difference between a project that holds
            together and one that forgets itself by next Tuesday.
            Treat the knowledge you build as pure gold. Organise it.
            Link it. Curate it. The agent needs it - and, more
            importantly, so does future you.
          </p>
        </div>
      </div>
    {/if}

    <!-- Stage 5 - the real takeaway, revealed at the end [TAKEAWAY 4] -->
    {#if keyLearningsStage.reveal(5)}
      <div class="punchline-card" data-staged="true">
        <div class="pl-label">The real takeaway</div>
        <div class="pl-title">This talk was about AI. The skills that matter are not.</div>
        <p class="pl-body">
          Leadership. Delegation. Information management. These were
          already the gold standard for effective individual work and
          human interaction - in any team, any classroom, any
          friendship, any family. Agentic AI does not replace them.
          It makes them non-negotiable.
        </p>
        <p class="pl-body">
          Get good at them here, where the stakes are a coursework
          mark and a curious tool. Carry them out - and you are good
          in every room you walk into.
        </p>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  .kl-root {
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
    font-size: 100px;
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

  .kl-column {
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

  /* === Skill cards - three hero cards, one per key learning ========== */

  .skill-card {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 32px;
    align-items: start;
    padding: 32px 36px;
    border: 1px solid var(--color-border-strong);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01)),
      rgba(0, 0, 0, 0.18);
    border-radius: var(--radius-lg);
    animation: fade-in 0.55s ease-out;
    box-shadow: 0 24px 64px -32px rgba(0, 0, 0, 0.5);
    position: relative;
    overflow: hidden;
  }

  .skill-card::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
  }

  .skill-card[data-tone='lead']::before {
    background: linear-gradient(180deg, rgba(245, 158, 11, 0.9), rgba(245, 158, 11, 0.4));
  }
  .skill-card[data-tone='delegate']::before {
    background: linear-gradient(180deg, rgba(236, 72, 153, 0.9), rgba(236, 72, 153, 0.4));
  }
  .skill-card[data-tone='info']::before {
    background: linear-gradient(180deg, rgba(96, 165, 250, 0.9), rgba(96, 165, 250, 0.4));
  }

  .sk-num {
    font-family: var(--font-mono);
    font-size: 80px;
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1;
    background: var(--gradient-headline);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    padding-top: 4px;
  }

  .sk-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  .sk-tag {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .skill-card[data-tone='lead'] .sk-tag {
    color: rgba(245, 158, 11, 1);
  }
  .skill-card[data-tone='delegate'] .sk-tag {
    color: rgba(236, 72, 153, 1);
  }
  .skill-card[data-tone='info'] .sk-tag {
    color: rgba(96, 165, 250, 1);
  }

  .sk-title {
    font-family: var(--font-sans);
    font-size: 36px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.2;
    color: var(--color-text);
  }

  .sk-text {
    margin: 0;
    font-size: 22px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  /* === Punchline card ================================================ */

  .punchline-card {
    padding: 38px 42px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background:
      linear-gradient(180deg, rgba(168, 85, 247, 0.14), rgba(236, 72, 153, 0.06)),
      rgba(0, 0, 0, 0.22);
    animation: fade-in 0.6s ease-out;
    box-shadow: 0 28px 72px -28px rgba(236, 72, 153, 0.35);
  }

  .pl-label {
    font-family: var(--font-mono);
    font-size: 18px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
    margin-bottom: 16px;
  }

  .pl-title {
    font-family: var(--font-sans);
    font-size: 44px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.15;
    background: var(--gradient-headline);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 22px;
    padding-bottom: 0.08em;
  }

  .pl-body {
    margin: 0;
    font-size: 26px;
    line-height: 1.45;
    color: var(--color-text);
  }

  .pl-body + .pl-body {
    margin-top: 18px;
  }

  /* === Takeaways rail (shared) ======================================= */

  .tail-spacer {
    height: 240px;
  }

  .kl-root .segment-header,
  .kl-root .kl-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .kl-root.two-col .segment-header,
  .kl-root.two-col .kl-column {
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
</style>
