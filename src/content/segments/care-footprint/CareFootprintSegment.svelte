<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { camera } from '$lib/camera/camera.svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { segments } from '$lib/segments/segments.svelte';
  import { DEFAULTS } from '$lib/constants';
  import { careFootprintStage } from './stage.svelte';

  let { segmentId = 'care-footprint' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, careFootprintStage));
  onDestroy(() => unregisterStage(segmentId));

  const vpWorldHeight = $derived(camera.viewportHeight / camera.zoom);
  const viewportTopY = $derived(camera.y - vpWorldHeight / 2);
  const railTopY = $derived(viewportTopY + 120);

  // Breakdown of the mid estimate (~4.5 kWh) across activity.
  // See docs/research/ai_energy_cost.md section 5.3 for the working.
  const breakdown = [
    { label: 'Output tokens', detail: 'AI replies + thinking + tool-call generation', kWh: 3.0 },
    { label: 'Uncached input', detail: 'Fresh context the model had to read from scratch', kWh: 1.4 },
    { label: 'Cached input', detail: 'Reused context (CLAUDE.md, docs/, source files)', kWh: 0.12 },
  ];
  const breakdownTotal = breakdown.reduce((s, b) => s + b.kWh, 0);

  // Comparison ladder - CO2 equivalents on a log-ish scale.
  // Each anchor has a label, a gram-CO2 value, and a "×project" multiplier.
  const THIS_PROJECT_GRAMS = 2300; // mid estimate
  const ladder = [
    { label: 'One Google search', gCO2: 0.03, note: 'Google 2025 disclosure' },
    { label: 'One chat turn with the agent', gCO2: 0.15, note: 'Epoch AI 2025, US grid' },
    { label: 'One hour of 4K Netflix on a TV', gCO2: 70, note: 'Carbon Trust, large screen' },
    { label: 'One km in a petrol car (UK average)', gCO2: 165, note: 'UK DfT 2024' },
    { label: 'THIS ENTIRE PROJECT (mid)', gCO2: THIS_PROJECT_GRAMS, note: 'our number, grid-weighted', highlight: true },
    { label: 'One cheeseburger', gCO2: 3500, note: 'UW-Madison LCA' },
    { label: 'One cotton T-shirt, made in India', gCO2: 10000, note: 'Carbonfact LCA' },
    { label: 'London to New York, round trip, economy', gCO2: 2_000_000, note: 'per passenger, Curb6' },
  ];
  const ladderMax = Math.max(...ladder.map((l) => l.gCO2));
  // Log scale so the flight doesn't crush everything else into 0px.
  const logLadderMax = Math.log10(ladderMax + 1);
  function ladderWidthPct(g: number) {
    return (Math.log10(g + 1) / logLadderMax) * 100;
  }
  function fmtG(g: number) {
    if (g < 1) return `${g.toFixed(2)} g`;
    if (g < 1000) return `${Math.round(g)} g`;
    if (g < 1_000_000) return `${(g / 1000).toFixed(g < 10000 ? 1 : 0)} kg`;
    return `${(g / 1_000_000).toFixed(1)} t`;
  }

  const takeaways = [
    { at: 3, text: 'The per-query cost is small. The daily aggregate, at the scale these tools now run, is a city. Both numbers are true.' },
    { at: 5, text: 'Vendor-reported numbers run around ten times lower than peer-reviewed ones. Know which you are quoting, and say so.' },
    { at: 8, text: 'The question is not "should I use this?" It is "was what I got worth what it cost?" That answer is yours to give.' },
  ];
  const takeawaysActive = $derived(careFootprintStage.reveal(takeaways[0].at));

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
    const _ = careFootprintStage.stageIndex;
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
  class="cf-root"
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
        <li class="takeaway" class:shown={careFootprintStage.reveal(item.at)}>
          <span class="t-index">{String(i + 1).padStart(2, '0')}</span>
          <span class="t-text">{item.text}</span>
        </li>
      {/each}
    </ol>
  </aside>

  <header class="segment-header">
    <span class="eyebrow">Sustainability · The honest numbers</span>
    <h1 class="headline-gradient">One cheeseburger. Is that the whole story?</h1>
    <p class="subhead">
      The hero number is honest for this project. The context around it
      is where the actual conversation lives. Peer-reviewed vs vendor,
      per-query vs aggregate, training vs inference.
    </p>
  </header>

  <div class="cf-column">
    <!-- Stage 1 - framing -->
    {#if careFootprintStage.reveal(1)}
      <div class="message user" data-staged="true">
        <div class="bubble">
          One cheeseburger feels small. Is that the whole story?
        </div>
      </div>
    {/if}

    <!-- Stage 2 - activity breakdown -->
    {#if careFootprintStage.reveal(2)}
      <div class="breakdown-card" data-staged="true">
        <div class="bc-head">
          <span class="bc-badge">Where the energy went</span>
          <span class="bc-title">4.5 kWh (mid), by activity.</span>
        </div>
        <div class="bc-stack">
          {#each breakdown as b, i (b.label)}
            <div class="bc-row" style:--i={i}>
              <div class="bc-label">
                <div class="bc-l-title">{b.label}</div>
                <div class="bc-l-detail">{b.detail}</div>
              </div>
              <div class="bc-bar-track">
                <div class="bc-bar-fill" style:width="{(b.kWh / breakdownTotal) * 100}%"></div>
              </div>
              <div class="bc-num">{b.kWh.toFixed(2)} kWh</div>
            </div>
          {/each}
        </div>
        <div class="bc-foot">
          <strong>Output dominates.</strong> Generating text, thinking
          tokens, and tool-call arguments is sequential and
          memory-bandwidth-bound; decode is where real electricity burns.
          Prompt caching keeps cached-input nearly free.
        </div>
      </div>
    {/if}

    <!-- Stage 3 - comparison ladder [TAKEAWAY 1] -->
    {#if careFootprintStage.reveal(3)}
      <div class="ladder-card" data-staged="true">
        <div class="lc-head">
          <span class="lc-badge">The comparison ladder</span>
          <span class="lc-title">CO<sub>2</sub>e, from a Google search to a flight. Log scale.</span>
        </div>
        <div class="lc-rows">
          {#each ladder as l, i (l.label)}
            <div class="lc-row" class:highlight={l.highlight} style:--i={i}>
              <div class="lc-l">{l.label}</div>
              <div class="lc-bar-track">
                <div class="lc-bar-fill" style:width="{ladderWidthPct(l.gCO2)}%"></div>
              </div>
              <div class="lc-value">{fmtG(l.gCO2)}</div>
              <div class="lc-note">{l.note}</div>
            </div>
          {/each}
        </div>
        <div class="lc-foot">
          One LHR-JFK return trip per passenger is about
          <strong>a thousand of this whole project</strong>. A single
          cotton T-shirt is about <strong>four</strong>. We
          did two months of work and emitted roughly
          <strong>one cheeseburger</strong>.
        </div>
      </div>
    {/if}

    <!-- Stage 4 - vendor vs independent gap -->
    {#if careFootprintStage.reveal(4)}
      <div class="versus-card" data-staged="true">
        <div class="vc-head">
          <span class="vc-badge">Read the fine print</span>
          <span class="vc-title">Who counted it, and what did they leave out?</span>
        </div>
        <div class="vc-rows">
          <div class="vc-row">
            <div class="vc-metric">Water per query</div>
            <div class="vc-vendor">
              <span class="vcv-src">Vendor (Altman, 2025)</span>
              <span class="vcv-val">0.32 mL</span>
            </div>
            <div class="vc-gap">~50x</div>
            <div class="vc-ind">
              <span class="vci-src">Peer-reviewed (Ren, 2023)</span>
              <span class="vci-val">10-25 mL</span>
            </div>
          </div>
          <div class="vc-row">
            <div class="vc-metric">Grid intensity, Iowa</div>
            <div class="vc-vendor">
              <span class="vcv-src">Market-based (Google)</span>
              <span class="vcv-val">494 g/kWh</span>
            </div>
            <div class="vc-gap">~1.4x</div>
            <div class="vc-ind">
              <span class="vci-src">Location-based (MISO)</span>
              <span class="vci-val">686 g/kWh</span>
            </div>
          </div>
          <div class="vc-row">
            <div class="vc-metric">Energy per query</div>
            <div class="vc-vendor">
              <span class="vcv-src">Vendor / Epoch 2025</span>
              <span class="vcv-val">~0.3 Wh</span>
            </div>
            <div class="vc-gap">~10x</div>
            <div class="vc-ind">
              <span class="vci-src">Earlier estimates (2023)</span>
              <span class="vci-val">~3 Wh</span>
            </div>
          </div>
        </div>
        <div class="vc-foot">
          Both numbers in each row are defensible - they just measure
          different things. Vendors tend to report a best-case slice
          (direct cooling only, market-based renewable matching, short
          chat queries). Independent researchers report a fuller
          accounting (upstream power-plant water, location-based
          marginal-grid emissions, reasoning-heavy workloads). For the
          talk: prefer <strong>location-based</strong> carbon and the
          <strong>Ren range</strong> for water, and say so.
        </div>
      </div>
    {/if}

    <!-- Stage 5 - training vs inference [TAKEAWAY 2] -->
    {#if careFootprintStage.reveal(5)}
      <div class="flip-card" data-staged="true">
        <div class="fc-head">
          <span class="fc-badge">The common misconception</span>
          <span class="fc-title">"Training was the expensive part, right?"</span>
        </div>
        <div class="fc-cols">
          <div class="fc-col">
            <div class="fc-col-label">Training (one-off)</div>
            <div class="fc-col-num">~50-60 GWh</div>
            <div class="fc-col-body">
              A single frontier model's training run. Roughly a small
              power station for a month. That is the number that makes
              headlines.
            </div>
          </div>
          <div class="fc-arrow">→</div>
          <div class="fc-col emphasis">
            <div class="fc-col-label">Inference (continuous)</div>
            <div class="fc-col-num">~50 GWh every 2-6 months</div>
            <div class="fc-col-body">
              Once a frontier model serves 10M+ daily active users,
              cumulative inference energy passes the training cost
              within months. After that, it keeps going.
            </div>
          </div>
        </div>
        <div class="fc-foot">
          <strong>Training is the size of a small power station for a
          month. Inference, at current scale, is the size of a small
          power station permanently.</strong>
          The first number retires; the second does not.
        </div>
      </div>
    {/if}

    <!-- Stage 6 - aggregate scale-up -->
    {#if careFootprintStage.reveal(6)}
      <div class="aggregate-card" data-staged="true">
        <div class="ac-head">
          <span class="ac-badge warn">The aggregate</span>
          <span class="ac-title">Per query: tiny. Per day, across hundreds of millions of queries: a city.</span>
        </div>
        <div class="ac-grid">
          <div class="ac-item">
            <div class="ac-num">700M</div>
            <div class="ac-unit">queries per day</div>
            <div class="ac-src">ChatGPT, early 2025</div>
          </div>
          <div class="ac-item">
            <div class="ac-num">35,000</div>
            <div class="ac-unit">US households of electricity</div>
            <div class="ac-src">per year, at 0.3 Wh/query</div>
          </div>
          <div class="ac-item">
            <div class="ac-num">1.2M</div>
            <div class="ac-unit">people's annual drinking water</div>
            <div class="ac-src">Luccioni et al. 2025</div>
          </div>
        </div>
        <div class="ac-foot">
          <em>The individual interaction is invisible. The aggregate is not.</em>
          This is the tension every AI user now lives with. Our cheeseburger
          sits inside a restaurant that serves a million of them an hour.
        </div>
      </div>
    {/if}

    <!-- Stage 7 - caveats -->
    {#if careFootprintStage.reveal(7)}
      <div class="caveats-card" data-staged="true">
        <div class="cv-head">
          <span class="cv-badge">What the talk must not skip</span>
        </div>
        <ol class="cv-list">
          <li>
            <span class="cv-n">01</span>
            <div>
              <div class="cv-t">Vendor self-reports are lobby-adjacent.</div>
              <div class="cv-b">
                Altman's 0.34 Wh / 0.32 mL per query is 10x lower than
                peer-reviewed estimates from just two years earlier.
                Some is genuine efficiency gain. Some is selective
                scope. Cite independent work where possible.
              </div>
            </div>
          </li>
          <li>
            <span class="cv-n">02</span>
            <div>
              <div class="cv-t">"100% renewable" is accounting, not physics.</div>
              <div class="cv-b">
                Every hyperscaler claims renewable matching via power
                purchase agreements. The electrons actually powering a
                Virginia data centre at 2am are still ~60% gas. Say
                "location-based emissions" when citing a carbon number
                and flag the marketing number as convention, not fact.
              </div>
            </div>
          </li>
          <li>
            <span class="cv-n">03</span>
            <div>
              <div class="cv-t">Per-query is not the right unit at scale.</div>
              <div class="cv-b">
                A single query's cost is invisible. Hundreds of millions
                per day is a small country's electricity bill. The
                honest conversation holds both numbers at once.
              </div>
            </div>
          </li>
        </ol>
      </div>
    {/if}

    <!-- Stage 8 - closer [TAKEAWAY 3] -->
    {#if careFootprintStage.reveal(8)}
      <div class="closer" data-staged="true">
        <div class="cl-label">The right question</div>
        <p class="cl-body">
          Use the tool. Count what it costs. Decide if what you got
          was worth what it took. This talk cost about one cheeseburger's
          worth of CO<sub>2</sub>. I think it was worth it. Other projects
          won't be. That decision - made honestly, with real numbers - is
          the craft.
        </p>
      </div>
    {/if}

    <div class="tail-spacer"></div>
  </div>
</div>

<style>
  .cf-root {
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
    font-size: 88px;
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

  .cf-column {
    width: min(920px, 100%);
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  /* Bubble + takeaways rail (shared) */
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

  /* === Breakdown card (stage 2) ====================================== */

  .breakdown-card {
    padding: 28px 32px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.02);
    animation: fade-in 0.5s ease-out;
  }

  .bc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    margin-bottom: 18px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .bc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .bc-title {
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
  }

  .bc-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .bc-row {
    display: grid;
    grid-template-columns: 240px 1fr 100px;
    gap: 18px;
    align-items: center;
    padding: 10px 0;
    opacity: 0;
    transform: translateY(6px);
    animation: bar-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(var(--i) * 0.12s);
  }

  .bc-label {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .bc-l-title {
    font-size: 18px;
    color: var(--color-text);
    font-weight: 500;
  }

  .bc-l-detail {
    font-size: 14px;
    color: var(--color-text-subtle);
    line-height: 1.4;
  }

  .bc-bar-track {
    height: 20px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 4px;
    overflow: hidden;
  }

  .bc-bar-fill {
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(168, 85, 247, 0.85),
      rgba(236, 72, 153, 0.85)
    );
    transform-origin: left;
    animation: bar-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: calc(var(--i) * 0.12s);
  }

  .bc-num {
    font-family: var(--font-mono);
    font-size: 18px;
    color: var(--color-text);
    text-align: right;
  }

  .bc-foot {
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid var(--color-border);
    font-size: 20px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .bc-foot strong {
    color: var(--color-text);
    font-weight: 600;
  }

  /* === Ladder card (stage 3) ========================================= */

  .ladder-card {
    padding: 28px 32px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.02);
    animation: fade-in 0.5s ease-out;
  }

  .lc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    margin-bottom: 18px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .lc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .lc-title {
    font-family: var(--font-sans);
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  .lc-rows {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .lc-row {
    display: grid;
    grid-template-columns: 280px 1fr 90px 160px;
    gap: 14px;
    align-items: center;
    padding: 8px 14px;
    border-radius: 8px;
    opacity: 0;
    transform: translateY(6px);
    animation: bar-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: calc(var(--i) * 0.06s);
  }

  .lc-row.highlight {
    background: rgba(236, 72, 153, 0.12);
    border: 1px solid rgba(236, 72, 153, 0.45);
    box-shadow: 0 0 24px -4px rgba(236, 72, 153, 0.3);
  }

  .lc-l {
    font-size: 16px;
    color: var(--color-text);
  }

  .lc-row.highlight .lc-l {
    font-weight: 600;
    color: var(--color-ai-mid);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: var(--font-mono);
    font-size: 14px;
  }

  .lc-bar-track {
    height: 14px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 3px;
    overflow: hidden;
  }

  .lc-bar-fill {
    height: 100%;
    background: rgba(168, 85, 247, 0.7);
    transform-origin: left;
    animation: bar-grow 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: calc(var(--i) * 0.06s);
  }

  .lc-row.highlight .lc-bar-fill {
    background: var(--gradient-accent);
    box-shadow: 0 0 16px -2px rgba(236, 72, 153, 0.5);
  }

  .lc-value {
    font-family: var(--font-mono);
    font-size: 16px;
    color: var(--color-text);
    text-align: right;
  }

  .lc-row.highlight .lc-value {
    color: var(--color-ai-mid);
    font-weight: 600;
  }

  .lc-note {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-text-subtle);
    line-height: 1.3;
  }

  .lc-foot {
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid var(--color-border);
    font-size: 20px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .lc-foot strong {
    color: var(--color-ai-mid);
    font-weight: 600;
  }

  /* === Versus card (stage 4) ========================================= */

  .versus-card {
    padding: 28px 32px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.02);
    animation: fade-in 0.5s ease-out;
  }

  .vc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    margin-bottom: 18px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .vc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: rgba(245, 158, 11, 0.8);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .vc-title {
    font-family: var(--font-sans);
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
  }

  .vc-rows {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .vc-row {
    display: grid;
    grid-template-columns: 180px 1fr 80px 1fr;
    gap: 14px;
    align-items: center;
    padding: 16px 18px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .vc-metric {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text);
  }

  .vc-vendor,
  .vc-ind {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 14px;
    border-radius: 8px;
  }

  .vc-vendor {
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  .vc-ind {
    background: rgba(74, 222, 128, 0.08);
    border: 1px solid rgba(74, 222, 128, 0.3);
  }

  .vcv-src, .vci-src {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .vcv-val, .vci-val {
    font-family: var(--font-mono);
    font-size: 20px;
    color: var(--color-text);
  }

  .vc-gap {
    font-family: var(--font-mono);
    font-size: 22px;
    font-weight: 600;
    color: var(--color-ai-end);
    text-align: center;
  }

  .vc-foot {
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid var(--color-border);
    font-size: 19px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .vc-foot strong {
    color: var(--color-text);
    font-weight: 600;
  }

  /* === Flip card (stage 5) =========================================== */

  .flip-card {
    padding: 28px 32px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.02);
    animation: fade-in 0.5s ease-out;
  }

  .fc-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .fc-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .fc-title {
    font-family: var(--font-sans);
    font-size: 26px;
    font-weight: 600;
    color: var(--color-text);
    font-style: italic;
  }

  .fc-cols {
    display: grid;
    grid-template-columns: 1fr 40px 1fr;
    gap: 16px;
    align-items: stretch;
  }

  .fc-col {
    padding: 22px 24px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .fc-col.emphasis {
    border-color: var(--color-tool-border);
    background:
      linear-gradient(180deg, rgba(168, 85, 247, 0.12), rgba(236, 72, 153, 0.04)),
      rgba(0, 0, 0, 0.2);
    box-shadow: 0 20px 48px -20px rgba(236, 72, 153, 0.3);
  }

  .fc-col-label {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .fc-col.emphasis .fc-col-label {
    color: var(--color-ai-mid);
  }

  .fc-col-num {
    font-family: var(--font-sans);
    font-size: 32px;
    font-weight: 600;
    letter-spacing: -0.02em;
    color: var(--color-text);
    line-height: 1.1;
  }

  .fc-col.emphasis .fc-col-num {
    background: var(--gradient-headline);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .fc-col-body {
    font-size: 17px;
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  .fc-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    color: var(--color-ai-mid);
  }

  .fc-foot {
    margin-top: 20px;
    padding-top: 14px;
    border-top: 1px solid var(--color-border);
    font-size: 20px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .fc-foot strong {
    color: var(--color-text);
    font-weight: 600;
  }

  /* === Aggregate card (stage 6) ====================================== */

  .aggregate-card {
    padding: 32px 36px;
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: var(--radius-lg);
    background:
      linear-gradient(180deg, rgba(245, 158, 11, 0.08), transparent 50%),
      rgba(0, 0, 0, 0.2);
    animation: fade-in 0.55s ease-out;
    box-shadow: 0 24px 64px -24px rgba(245, 158, 11, 0.25);
  }

  .ac-head {
    display: flex;
    align-items: baseline;
    gap: 16px;
    padding-bottom: 14px;
    margin-bottom: 22px;
    border-bottom: 1px solid var(--color-border);
    flex-wrap: wrap;
  }

  .ac-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--color-ai-end);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .ac-title {
    font-family: var(--font-sans);
    font-size: 26px;
    font-weight: 600;
    color: var(--color-text);
  }

  .ac-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 22px;
  }

  .ac-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 20px 22px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .ac-num {
    font-family: var(--font-sans);
    font-size: 54px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1;
    color: var(--color-ai-end);
    padding-bottom: 0.05em;
  }

  .ac-unit {
    font-family: var(--font-mono);
    font-size: 15px;
    letter-spacing: 0.08em;
    color: var(--color-text);
    text-transform: uppercase;
    line-height: 1.3;
  }

  .ac-src {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    color: var(--color-text-subtle);
    margin-top: auto;
  }

  .ac-foot {
    margin-top: 22px;
    padding-top: 14px;
    border-top: 1px solid var(--color-border);
    font-size: 22px;
    line-height: 1.5;
    color: var(--color-text);
  }

  .ac-foot em {
    font-style: italic;
    color: var(--color-ai-end);
  }

  /* === Caveats card (stage 7) ======================================== */

  .caveats-card {
    padding: 28px 32px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.02);
    animation: fade-in 0.5s ease-out;
  }

  .cv-head {
    padding-bottom: 14px;
    margin-bottom: 18px;
    border-bottom: 1px solid var(--color-border);
  }

  .cv-badge {
    font-family: var(--font-mono);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: white;
    background: var(--gradient-accent);
    padding: 5px 12px;
    border-radius: 6px;
  }

  .cv-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .cv-list li {
    display: grid;
    grid-template-columns: 52px 1fr;
    gap: 18px;
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid var(--color-border);
    border-radius: 10px;
  }

  .cv-n {
    font-family: var(--font-mono);
    font-size: 22px;
    font-weight: 600;
    color: var(--color-ai-mid);
    letter-spacing: 0.06em;
  }

  .cv-t {
    font-family: var(--font-sans);
    font-size: 22px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--color-text);
    margin-bottom: 8px;
  }

  .cv-b {
    font-size: 18px;
    line-height: 1.55;
    color: var(--color-text-muted);
  }

  /* === Closer (stage 8) ============================================== */

  .closer {
    padding: 32px 36px;
    border: 1px solid var(--color-tool-border);
    border-radius: var(--radius-lg);
    background: rgba(168, 85, 247, 0.08);
    animation: fade-in 0.55s ease-out;
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
    font-size: 28px;
    line-height: 1.45;
    color: var(--color-text);
    font-weight: 400;
  }

  /* === Takeaways rail (shared) ======================================= */

  .tail-spacer {
    height: 240px;
  }

  .cf-root .segment-header,
  .cf-root .cf-column {
    transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .cf-root.two-col .segment-header,
  .cf-root.two-col .cf-column {
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
  .rr-label.visible { opacity: 1; }
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

  @keyframes bar-in {
    to { opacity: 1; transform: translateY(0); }
  }
</style>
