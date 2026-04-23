<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { careOverviewStage } from './stage.svelte';

  let { segmentId = 'care-overview' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, careOverviewStage));
  onDestroy(() => unregisterStage(segmentId));

  // Three groups, one reveal stage each. Each group holds 2-3 beat cards.
  // The stage index of the group is also the order in which the group's
  // cards animate in; cards stagger inside their group via --i.
  type Beat = { num: string; title: string; blurb: string };
  type Group = {
    stage: number;
    label: string;
    accent: 'legal' | 'ethical' | 'mechanical';
    beats: Beat[];
  };

  const groups: Group[] = [
    {
      stage: 1,
      label: 'Mechanical limits',
      accent: 'mechanical',
      beats: [
        {
          num: '01',
          title: 'Confidently wrong',
          blurb: 'Plausible, fluent, and off. The subtle failures are the dangerous ones.',
        },
        {
          num: '02',
          title: 'The agreement trap',
          blurb: 'The agent tries to please. Lead it and you lose a critical partner.',
        },
        {
          num: '03',
          title: 'The visual gap',
          blurb: 'UI, UX, animation, interactivity. Still a human call, on purpose.',
        },
      ],
    },
    {
      stage: 2,
      label: 'Legal + ownership',
      accent: 'legal',
      beats: [
        {
          num: '04',
          title: 'What went in',
          blurb: 'Training data provenance. What paid services will and will not stand behind.',
        },
        {
          num: '05',
          title: 'Who owns this?',
          blurb: 'Copyrightability of what you ship. Human contribution is the line that matters.',
        },
      ],
    },
    {
      stage: 3,
      label: 'Ethical practice',
      accent: 'ethical',
      beats: [
        {
          num: '06',
          title: 'What you put in',
          blurb: 'What the agent can read, what it cannot, and why "just do not ingest it" fails.',
        },
        {
          num: '07',
          title: 'Name your collaborators',
          blurb: 'Declare what was made with the agent. Session logs as a lightweight pattern. A live audit of this talk.',
        },
        {
          num: '08',
          title: 'Environment impact',
          blurb: 'How much energy and water one session costs, and what the whole-industry scale-up looks like.',
        },
      ],
    },
  ];
</script>

<div class="co-root" data-segment-root>
  <header class="segment-header">
    <span class="eyebrow">The fine print</span>
    <h1 class="headline-gradient">Where care is required</h1>
    <p class="subhead">
      Eight places agentic AI needs a careful hand. Three flavours: where
      the model itself still falls short, what the law says, and what good
      practice asks of you.
    </p>
  </header>

  <div class="groups">
    {#each groups as group (group.label)}
      <div
        class="group"
        data-accent={group.accent}
        class:revealed={careOverviewStage.reveal(group.stage)}
      >
        <div class="g-head">
          <span class="g-rule"></span>
          <span class="g-label">{group.label}</span>
        </div>
        <div class="g-beats">
          {#each group.beats as beat, i (beat.num)}
            <div
              class="beat"
              style:--i={i}
              class:visible={careOverviewStage.reveal(group.stage)}
            >
              <span class="b-num">{beat.num}</span>
              <div class="b-body">
                <div class="b-title">{beat.title}</div>
                <div class="b-blurb">{beat.blurb}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  {#if careOverviewStage.reveal(4)}
    <div class="closer">
      <span class="cl-dot"></span>
      <p class="cl-body">
        Each of these gets its own beat. Here they are, in turn.
      </p>
    </div>
  {/if}
</div>

<style>
  /* === Layout - single screen 1920x1080, three-column preview. ======== */

  .co-root {
    width: 100%;
    height: 100%;
    padding: 80px 120px 60px 120px;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 40px;
    overflow: hidden;
  }

  .segment-header {
    max-width: 1400px;
  }

  .eyebrow {
    display: inline-block;
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    margin-bottom: 16px;
  }

  h1 {
    font-family: var(--font-sans);
    font-size: 88px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.1;
    padding-bottom: 0.08em;
    margin: 0;
  }

  .subhead {
    margin-top: 18px;
    font-size: 26px;
    line-height: 1.5;
    color: var(--color-text-muted);
    max-width: 44em;
  }

  /* === Three-column grid of groups ================================== */

  .groups {
    display: grid;
    /* Widths roughly proportional to card count: 3 / 2 / 3. */
    grid-template-columns: 1.4fr 1fr 1.4fr;
    gap: 40px;
    min-height: 0;
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: 0;
    opacity: 0;
    transform: translateY(14px);
    transition:
      opacity 0.5s ease,
      transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .group.revealed {
    opacity: 1;
    transform: translateY(0);
  }

  .g-head {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color-border);
  }

  .g-rule {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .group[data-accent='legal'] .g-rule {
    background: rgba(59, 130, 246, 0.9);
  }
  .group[data-accent='ethical'] .g-rule {
    background: var(--color-ai-mid);
  }
  .group[data-accent='mechanical'] .g-rule {
    background: rgba(245, 158, 11, 0.9);
  }

  .g-label {
    font-family: var(--font-mono);
    font-size: 17px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-text);
  }

  .g-beats {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0;
  }

  /* === Beat cards ================================================= */

  .beat {
    display: grid;
    grid-template-columns: 64px 1fr;
    gap: 18px;
    align-items: flex-start;
    padding: 20px 22px;
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-md);
    opacity: 0;
    transform: translateY(10px);
    transition:
      opacity 0.5s ease,
      transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.4s ease,
      background 0.4s ease;
  }

  .beat.visible {
    opacity: 1;
    transform: translateY(0);
    /* Stagger inside the group so the cards don't all snap in at once. */
    transition-delay: calc(var(--i) * 0.1s);
  }

  .group[data-accent='legal'] .beat {
    border-left: 3px solid rgba(59, 130, 246, 0.55);
  }
  .group[data-accent='ethical'] .beat {
    border-left: 3px solid rgba(236, 72, 153, 0.55);
  }
  .group[data-accent='mechanical'] .beat {
    border-left: 3px solid rgba(245, 158, 11, 0.55);
  }

  .b-num {
    font-family: var(--font-mono);
    font-size: 28px;
    font-weight: 500;
    letter-spacing: 0.06em;
    color: var(--color-text-subtle);
    line-height: 1;
    padding-top: 2px;
  }

  .b-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .b-title {
    font-family: var(--font-sans);
    font-size: 26px;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.2;
    color: var(--color-text);
  }

  .b-blurb {
    font-size: 18px;
    line-height: 1.45;
    color: var(--color-text-muted);
  }

  /* === Closer ==================================================== */

  .closer {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px 26px;
    background: rgba(168, 85, 247, 0.08);
    border: 1px solid var(--color-tool-border);
    border-radius: var(--radius-md);
    max-width: 900px;
    animation: fade-up 0.5s ease-out;
  }

  .cl-dot {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-ai-mid);
    box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4);
    animation: pulse 1.8s ease-in-out infinite;
  }

  .cl-body {
    margin: 0;
    font-size: 22px;
    line-height: 1.4;
    color: var(--color-text);
  }

  @keyframes fade-up {
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
      box-shadow: 0 0 0 6px rgba(236, 72, 153, 0);
    }
  }
</style>
