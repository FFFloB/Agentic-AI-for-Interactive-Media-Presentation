<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { skillsStage } from './stage.svelte';

  let { segmentId = 'skills' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, skillsStage));
  onDestroy(() => unregisterStage(segmentId));

  // Bullet-list template: each entry is one stage.
  // Reused pattern - swap the `items` array to repurpose the layout.
  const items = [
    { title: 'Programming', desc: 'Game and app logic, systems, back-end services.' },
    { title: 'UI & frontend', desc: 'Screens, components, interaction flows.' },
    { title: 'Visual design', desc: 'Art direction, 2D and 3D, motion graphics.' },
    { title: 'Interaction design', desc: 'Affordances, feedback, ergonomics.' },
    { title: 'Writing & narrative', desc: 'Copy, content, documentation, story.' },
    { title: 'Audio & music', desc: 'Sound design, score, voice.' },
    { title: 'Animation & motion', desc: 'Character, environment, UI motion.' },
    { title: 'Prototyping & QA', desc: 'Rapid iteration, testing, polish.' },
  ];
</script>

<div class="skills-root" data-segment-root>
  <header class="skills-header">
    <span class="eyebrow">Interactive media</span>
    <h1 class="headline-gradient">A broad skills landscape</h1>
    <p class="subhead">
      Making interactive media blends many crafts - from the technical to the narrative.
    </p>
  </header>

  <ol class="skills-grid">
    {#each items as item, i (item.title)}
      <li class="skill" class:shown={skillsStage.reveal(i + 1)}>
        <span class="s-index">{String(i + 1).padStart(2, '0')}</span>
        <div class="s-body">
          <h3 class="s-title">{item.title}</h3>
          <p class="s-desc">{item.desc}</p>
        </div>
      </li>
    {/each}
  </ol>
</div>

<style>
  .skills-root {
    width: 100%;
    height: 100%;
    padding: 120px 140px 140px 140px;
    display: flex;
    flex-direction: column;
    gap: 80px;
  }

  .skills-header {
    max-width: 1400px;
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

  .skills-grid {
    list-style: none;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px 100px;
    padding: 0;
    margin: 0;
  }

  .skill {
    display: grid;
    grid-template-columns: 88px 1fr;
    gap: 28px;
    align-items: baseline;
    opacity: 0;
    transform: translateY(14px);
    transition:
      opacity 0.5s ease,
      transform 0.5s ease;
    will-change: opacity, transform;
  }

  .skill.shown {
    opacity: 1;
    transform: translateY(0);
  }

  .s-index {
    font-family: var(--font-mono);
    font-size: 26px;
    color: var(--color-text-subtle);
    letter-spacing: 0.1em;
  }

  .s-title {
    font-family: var(--font-sans);
    font-size: 38px;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.1;
    color: var(--color-text);
    margin: 0;
    padding-bottom: 0.05em;
  }

  .s-desc {
    margin-top: 10px;
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }
</style>
