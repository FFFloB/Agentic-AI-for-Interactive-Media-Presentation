<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { registerStage, unregisterStage } from '$lib/stage/stage-registry';
  import { careAuditStage } from './stage.svelte';
  import { AUDIT_DATA, type AuditSession, type AuditEvent } from './data';

  let { segmentId = 'care-audit' }: { segmentId?: string } = $props();

  onMount(() => registerStage(segmentId, careAuditStage));
  onDestroy(() => unregisterStage(segmentId));

  // === Timeline state ================================================
  //
  // The viewport is a time-range [tMin, tMax] in epoch ms. Default = the
  // full span of the recorded sessions plus a small padding at each end.

  const FIRST = AUDIT_DATA.firstMs;
  const LAST = AUDIT_DATA.lastMs;
  const FULL_SPAN = LAST - FIRST;
  const PAD = FULL_SPAN * 0.02;
  const T_MIN_INIT = FIRST - PAD;
  const T_MAX_INIT = LAST + PAD;

  let tMin = $state(T_MIN_INIT);
  let tMax = $state(T_MAX_INIT);

  // Canvas dimensions tracked via ResizeObserver.
  let canvasEl: HTMLCanvasElement | null = $state(null);
  let wrapperEl: HTMLDivElement | null = $state(null);
  let canvasW = $state(0);
  let canvasH = $state(0);
  let dpr = $state(1);

  // Hover + selection.
  let hoverId = $state<string | null>(null);
  let selectedId = $state<string | null>(null);

  // Pointer drag state (for panning).
  let isPanning = $state(false);
  let panStartX = 0;
  let panStartT = 0;
  let dragMoved = false;

  const selectedSession = $derived(
    selectedId ? AUDIT_DATA.sessions.find((s) => s.id === selectedId) ?? null : null,
  );

  // === Canvas setup / resize =========================================

  let ro: ResizeObserver | null = null;

  $effect(() => {
    if (!wrapperEl) return;
    dpr = window.devicePixelRatio || 1;
    ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvasW = Math.max(1, Math.round(width));
        canvasH = Math.max(1, Math.round(height));
        resizeCanvas();
      }
    });
    ro.observe(wrapperEl);
    return () => ro?.disconnect();
  });

  function resizeCanvas() {
    if (!canvasEl) return;
    // Backing buffer sized in device pixels for crisp output. The canvas's
    // CSS size is driven by the stylesheet (width: 100% of wrapper), so
    // the element shrinks happily when the layout splits in half - no
    // inline width to fight the grid.
    canvasEl.width = Math.round(canvasW * dpr);
    canvasEl.height = Math.round(canvasH * dpr);
    draw();
  }

  // === Time <-> screen conversion ======================================

  function tToX(t: number): number {
    return ((t - tMin) / (tMax - tMin)) * canvasW;
  }
  function xToT(x: number): number {
    return tMin + (x / canvasW) * (tMax - tMin);
  }

  // === Zoom (mouse wheel, centred on cursor) ==========================

  // The whole segment sits inside the camera's CSS transform, so a canvas
  // that is logically 1920px wide can appear at, say, 1366px on screen.
  // getBoundingClientRect() reports the *visual* (post-transform) size,
  // so we have to rescale clientX into the canvas's logical pixel space
  // before feeding it to anything that uses `canvasW`.
  function pointerToLogicalX(ev: PointerEvent | WheelEvent): number {
    if (!canvasEl) return 0;
    const rect = canvasEl.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return ((ev.clientX - rect.left) / rect.width) * canvasW;
  }

  function onWheel(ev: WheelEvent) {
    ev.preventDefault();
    if (!canvasEl) return;
    const x = pointerToLogicalX(ev);
    // Normalise across browsers/trackpads.
    const k = Math.exp(ev.deltaY * 0.0015);
    zoomAt(x, k);
  }

  function zoomAt(x: number, factor: number) {
    const tAtCursor = xToT(x);
    const newSpan = Math.max(
      30_000, // min 30 seconds visible
      Math.min(FULL_SPAN * 2, (tMax - tMin) * factor),
    );
    const left = tAtCursor - (x / canvasW) * newSpan;
    tMin = left;
    tMax = left + newSpan;
    clampViewport();
    draw();
  }

  function clampViewport() {
    const span = tMax - tMin;
    if (span > FULL_SPAN * 2) {
      const c = (tMin + tMax) / 2;
      tMin = c - FULL_SPAN;
      tMax = c + FULL_SPAN;
    }
    // Soft pan limits - allow small overshoot at each edge for breathing.
    const maxOver = span * 0.3;
    if (tMin < FIRST - maxOver) {
      tMin = FIRST - maxOver;
      tMax = tMin + span;
    }
    if (tMax > LAST + maxOver) {
      tMax = LAST + maxOver;
      tMin = tMax - span;
    }
  }

  // === Pan (drag) =====================================================

  function onPointerDown(ev: PointerEvent) {
    if (!canvasEl) return;
    try {
      (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    } catch {
      // Some pointer types may refuse capture; non-fatal.
    }
    isPanning = true;
    dragMoved = false;
    panStartX = pointerToLogicalX(ev);
    panStartT = tMin;
  }

  function onPointerMove(ev: PointerEvent) {
    if (!canvasEl) return;
    const x = pointerToLogicalX(ev);

    if (isPanning) {
      const dx = x - panStartX;
      const dt = (dx / canvasW) * (tMax - tMin);
      const span = tMax - tMin;
      tMin = panStartT - dt;
      tMax = tMin + span;
      clampViewport();
      // Threshold in logical px; a little generous so jittery clicks still
      // register as clicks rather than micro-pans.
      if (Math.abs(dx) > 5) dragMoved = true;
      draw();
    } else {
      const sess = sessionAt(x);
      if (hoverId !== (sess?.id ?? null)) {
        hoverId = sess?.id ?? null;
        draw();
      }
    }
  }

  function onPointerUp(ev: PointerEvent) {
    if (!canvasEl) return;
    try {
      (ev.currentTarget as HTMLElement).releasePointerCapture(ev.pointerId);
    } catch {
      // ignore
    }
    const wasPanning = isPanning;
    isPanning = false;
    if (wasPanning && !dragMoved) {
      // Treat as click.
      const x = pointerToLogicalX(ev);
      const sess = sessionAt(x);
      if (sess) {
        selectedId = selectedId === sess.id ? null : sess.id;
      }
    }
  }

  function onPointerLeave() {
    if (hoverId !== null) {
      hoverId = null;
      draw();
    }
  }

  // === Hit testing ==================================================

  // Session blocks occupy the full canvas height; we hit-test in time
  // space only. x is in the canvas's logical pixel space.
  function sessionAt(x: number): AuditSession | null {
    const t = xToT(x);
    // Small forgiveness on the edges - makes clicking narrow blocks viable.
    const slackMs = ((tMax - tMin) / canvasW) * 4;
    for (const s of AUDIT_DATA.sessions) {
      if (t >= s.startMs - slackMs && t <= s.endMs + slackMs) return s;
    }
    return null;
  }

  // === Rendering =====================================================

  // Layout constants inside the canvas.
  const BLOCK_PAD_Y = 12;
  const AXIS_H = 28;

  // Four stacked, non-overlapping tracks inside every session block.
  // Top to bottom: human input, AI messages, thinking, tool use.
  // Each bar represents the *duration* of one activity (computed by the
  // preprocessor), so the visualisation reads as a Gantt chart of real
  // wall-clock time.
  const TRACK_ORDER: Array<AuditEvent['kind']> = [
    'user',
    'assistant',
    'thinking',
    'tool',
  ];
  const TRACK_STYLE: Record<
    AuditEvent['kind'],
    { fill: string; stroke: string; label: string }
  > = {
    user: {
      fill: 'rgba(52, 211, 153, 0.7)',
      stroke: 'rgba(52, 211, 153, 0.95)',
      label: 'human',
    },
    assistant: {
      fill: 'rgba(236, 72, 153, 0.7)',
      stroke: 'rgba(236, 72, 153, 0.95)',
      label: 'ai',
    },
    thinking: {
      fill: 'rgba(200, 200, 220, 0.4)',
      stroke: 'rgba(200, 200, 220, 0.7)',
      label: 'think',
    },
    tool: {
      fill: 'rgba(96, 165, 250, 0.7)',
      stroke: 'rgba(96, 165, 250, 0.95)',
      label: 'tool',
    },
  };

  function fmtDate(t: number): string {
    const d = new Date(t);
    return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  }

  function fmtDateTime(t: number): string {
    const d = new Date(t);
    return (
      d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }

  function fmtDuration(ms: number): string {
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.round(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rest = m % 60;
    return `${h}h ${rest}m`;
  }

  // Finer-grained formatter for event-level durations that can be very
  // short (tool calls often complete in milliseconds).
  function fmtShortDur(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 10_000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
    const m = Math.floor(ms / 60_000);
    const s = Math.round((ms % 60_000) / 1000);
    if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}h ${mm}m`;
  }

  // Detail-fade thresholds, in ms of *visible timespan*. Details are
  // invisible at wide zoom, fully visible at tight zoom, linearly
  // interpolated in between. Zooming past the in-threshold is no more
  // visible, zooming out past the out-threshold fully hides the strip.
  const DETAIL_FADE_OUT_SPAN_MS = 12 * 60 * 60 * 1000; // 12h visible
  const DETAIL_FADE_IN_SPAN_MS = 3 * 60 * 60 * 1000; //  3h visible

  // Computed per-draw and read by drawSession / drawEventMarkers below.
  let detailOpacity = 0;

  function draw() {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = canvasW;
    const h = canvasH;
    ctx.clearRect(0, 0, w, h);

    // Background grid: faint vertical date gridlines.
    const span = tMax - tMin;
    const gridInterval = chooseGridInterval(span, w);
    drawGrid(ctx, gridInterval, w, h);

    // Zoom-based detail opacity. Shared by every session block this
    // frame so they all reveal or dim together as the user scrolls.
    if (span >= DETAIL_FADE_OUT_SPAN_MS) {
      detailOpacity = 0;
    } else if (span <= DETAIL_FADE_IN_SPAN_MS) {
      detailOpacity = 1;
    } else {
      detailOpacity =
        (DETAIL_FADE_OUT_SPAN_MS - span) /
        (DETAIL_FADE_OUT_SPAN_MS - DETAIL_FADE_IN_SPAN_MS);
    }
    // Ease the linear factor for a softer transition than a pure ramp.
    detailOpacity = detailOpacity * detailOpacity * (3 - 2 * detailOpacity);

    // Session blocks.
    const blockTop = BLOCK_PAD_Y;
    const blockBottom = h - AXIS_H - BLOCK_PAD_Y;
    const blockHeight = blockBottom - blockTop;
    const pxPerMs = w / span;

    for (const s of AUDIT_DATA.sessions) {
      const x = tToX(s.startMs);
      const width = s.durationMs * pxPerMs;
      if (x + width < 0 || x > w) continue;
      drawSession(
        ctx,
        s,
        x,
        blockTop,
        Math.max(2, width),
        blockHeight,
        pxPerMs,
      );
    }

    // Time axis at the bottom.
    drawAxis(ctx, gridInterval, w, h);
  }

  function chooseGridInterval(spanMs: number, wPx: number): number {
    // Aim for ~10 gridlines across.
    const targetCount = 10;
    const rough = spanMs / targetCount;
    const candidates = [
      60_000, // 1min
      5 * 60_000,
      15 * 60_000,
      30 * 60_000,
      60 * 60_000, // 1h
      3 * 60 * 60_000,
      6 * 60 * 60_000,
      12 * 60 * 60_000,
      24 * 60 * 60_000, // 1d
      3 * 24 * 60 * 60_000,
      7 * 24 * 60 * 60_000,
      14 * 24 * 60 * 60_000,
      30 * 24 * 60 * 60_000,
    ];
    for (const c of candidates) if (c >= rough) return c;
    return candidates[candidates.length - 1];
  }

  function drawGrid(
    ctx: CanvasRenderingContext2D,
    interval: number,
    w: number,
    h: number,
  ) {
    const start = Math.floor(tMin / interval) * interval;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let t = start; t <= tMax; t += interval) {
      const x = tToX(t);
      if (x < 0 || x > w) continue;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h - AXIS_H);
    }
    ctx.stroke();
  }

  function drawAxis(
    ctx: CanvasRenderingContext2D,
    interval: number,
    w: number,
    h: number,
  ) {
    const axisY = h - AXIS_H;
    // Axis baseline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(0, axisY);
    ctx.lineTo(w, axisY);
    ctx.stroke();

    const start = Math.floor(tMin / interval) * interval;
    ctx.fillStyle = 'rgba(242, 242, 248, 0.55)';
    ctx.font = '13px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    const dayMs = 24 * 60 * 60_000;
    const showTime = interval < dayMs;

    for (let t = start; t <= tMax; t += interval) {
      const x = tToX(t);
      if (x < 0 || x > w) continue;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(x, axisY);
      ctx.lineTo(x, axisY + 6);
      ctx.stroke();
      const label = showTime ? fmtDateTime(t) : fmtDate(t);
      ctx.fillText(label, x + 6, axisY + 8);
    }
  }

  function drawSession(
    ctx: CanvasRenderingContext2D,
    s: AuditSession,
    x: number,
    y: number,
    w: number,
    h: number,
    pxPerMs: number,
  ) {
    const isSel = s.id === selectedId;
    const isHov = s.id === hoverId;

    // Block fill
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, 'rgba(168, 85, 247, 0.28)');
    grad.addColorStop(1, 'rgba(236, 72, 153, 0.12)');
    ctx.fillStyle = isSel
      ? 'rgba(236, 72, 153, 0.32)'
      : isHov
        ? 'rgba(168, 85, 247, 0.32)'
        : (grad as unknown as string);
    // Re-assigning grad through the string branch above is weird in TS -
    // just set it directly in the else path:
    if (!isSel && !isHov) ctx.fillStyle = grad;

    roundRect(ctx, x, y, w, h, 4);
    ctx.fill();

    // Block stroke
    ctx.strokeStyle = isSel
      ? 'rgba(236, 72, 153, 0.9)'
      : isHov
        ? 'rgba(236, 72, 153, 0.55)'
        : 'rgba(168, 85, 247, 0.45)';
    ctx.lineWidth = isSel ? 2 : 1;
    roundRect(ctx, x, y, w, h, 4);
    ctx.stroke();

    // Event bars are gated by the *viewport* zoom level, not by this
    // individual block's width - so all sessions reveal their detail
    // together rather than long sessions popping in before short ones.
    // See detailOpacity computation in draw().
    if (detailOpacity > 0) {
      drawEventMarkers(ctx, s, x, y, w, h, pxPerMs, detailOpacity);
    }

    // Title overlay - appears once the block can hold readable text.
    if (w >= 40) {
      drawSessionLabel(ctx, s, x, y, w, h);
    }

    // Cursor overlay - only on the selected session, shows the slice
    // currently visible in the detail panel's scroll viewport.
    if (isSel && viewportEndT > viewportStartT) {
      drawViewportCursor(ctx, x, y, w, h, pxPerMs);
    }
  }

  function drawViewportCursor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    pxPerMs: number,
  ) {
    // Clamp the cursor's pixel range to the session block so it can't
    // paint over adjacent blocks on the timeline.
    const cx0 = Math.max(x, x + viewportStartT * pxPerMs);
    const cx1 = Math.min(x + w, x + viewportEndT * pxPerMs);
    const cw = Math.max(3, cx1 - cx0);

    ctx.save();
    // Tinted rectangle over the visible window.
    ctx.fillStyle = 'rgba(236, 72, 153, 0.18)';
    ctx.fillRect(cx0, y, cw, h);

    // Frame lines at each edge, plus top / bottom rules for emphasis.
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Left edge
    ctx.moveTo(cx0, y);
    ctx.lineTo(cx0, y + h);
    // Right edge
    ctx.moveTo(cx1, y);
    ctx.lineTo(cx1, y + h);
    // Top + bottom bars
    ctx.moveTo(cx0, y + 1);
    ctx.lineTo(cx1, y + 1);
    ctx.moveTo(cx0, y + h - 1);
    ctx.lineTo(cx1, y + h - 1);
    ctx.stroke();

    // Small "eye" marker above the block so the cursor is obvious even
    // when the block is narrow.
    const notchY = y - 6;
    const notchX = (cx0 + cx1) / 2;
    ctx.fillStyle = 'rgba(236, 72, 153, 0.95)';
    ctx.beginPath();
    ctx.moveTo(notchX, notchY + 6);
    ctx.lineTo(notchX - 5, notchY);
    ctx.lineTo(notchX + 5, notchY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawEventMarkers(
    ctx: CanvasRenderingContext2D,
    s: AuditSession,
    x: number,
    y: number,
    w: number,
    h: number,
    pxPerMs: number,
    opacity: number,
  ) {
    // Clip to block interior so bars don't leak out at the edges.
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    roundRect(ctx, x, y, w, h, 4);
    ctx.clip();

    // Layout: the bottom ~55% of the block is the Gantt strip, split
    // into four equal tracks. The top portion of the block is reserved
    // for the session caption. If the block is too short overall, the
    // strip shrinks but tracks stay proportional.
    const stripTop = y + h * 0.45;
    const stripH = h - (stripTop - y) - 4; // 4px bottom pad
    const trackH = stripH / TRACK_ORDER.length;
    const gap = Math.max(1, Math.min(2, trackH * 0.08));
    const barH = trackH - gap * 2;

    // Draw faint track backgrounds so empty tracks still read as a row.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < TRACK_ORDER.length; i++) {
      const ty = stripTop + i * trackH + gap;
      ctx.fillRect(x + 1, ty, w - 2, barH);
    }

    // Draw each track's events as duration bars.
    for (let i = 0; i < TRACK_ORDER.length; i++) {
      const kind = TRACK_ORDER[i];
      const style = TRACK_STYLE[kind];
      const ty = stripTop + i * trackH + gap;
      ctx.fillStyle = style.fill;
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 1;

      for (const e of s.events) {
        if (e.kind !== kind) continue;
        // Event ends at e.t; activity started at (e.t - e.dur).
        const endX = x + e.t * pxPerMs;
        const startX = x + (e.t - e.dur) * pxPerMs;
        if (endX < x - 1 || startX > x + w + 1) continue;
        const bx = Math.max(startX, x);
        const bw = Math.max(1.5, Math.min(endX, x + w) - bx);
        ctx.fillRect(bx, ty, bw, barH);
        if (bw >= 3) {
          // Outline once the bar is wide enough that the stroke doesn't
          // just double the perceived thickness.
          ctx.strokeRect(bx + 0.5, ty + 0.5, bw - 1, barH - 1);
        }
      }
    }

    // Subtle track dividers for legibility.
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 1; i < TRACK_ORDER.length; i++) {
      const ly = stripTop + i * trackH;
      ctx.beginPath();
      ctx.moveTo(x + 1, ly);
      ctx.lineTo(x + w - 1, ly);
      ctx.stroke();
    }

    // Track labels on the left edge once the block is wide enough.
    // These fade with the same opacity so they appear in sync.
    if (w >= 260) {
      ctx.fillStyle = 'rgba(242, 242, 248, 0.4)';
      ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      for (let i = 0; i < TRACK_ORDER.length; i++) {
        const kind = TRACK_ORDER[i];
        const cy = stripTop + i * trackH + trackH / 2;
        ctx.fillText(TRACK_STYLE[kind].label, x + 8, cy);
      }
    }

    ctx.restore();
  }

  function drawSessionLabel(
    ctx: CanvasRenderingContext2D,
    s: AuditSession,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    // Short caption when narrow; full title when wide.
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, x + 4, y + 4, w - 8, h - 8, 3);
    ctx.clip();

    const date = new Date(s.startMs);
    const dateStr = date.toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
    });

    ctx.fillStyle = 'rgba(242, 242, 248, 0.95)';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    if (w < 120) {
      // Just the date, vertically centered.
      ctx.font = '600 14px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillText(dateStr, x + 8, y + 8);
    } else {
      // Date + duration on first line, then title.
      ctx.font = '600 13px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillStyle = 'rgba(242, 242, 248, 0.55)';
      ctx.fillText(
        `${dateStr}  ·  ${fmtDuration(s.durationMs)}  ·  ${
          s.stats.user
        }U / ${s.stats.assistant}A / ${s.stats.tools}T`,
        x + 10,
        y + 10,
      );
      ctx.fillStyle = 'rgba(242, 242, 248, 0.98)';
      ctx.font = '600 18px Inter, system-ui, sans-serif';
      ctx.fillText(s.title, x + 10, y + 32);
    }

    ctx.restore();
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  // Redraw when viewport or selection changes.
  $effect(() => {
    // Touch reactive deps so Svelte re-runs this when they change.
    tMin;
    tMax;
    hoverId;
    selectedId;
    canvasW;
    canvasH;
    viewportStartT;
    viewportEndT;
    draw();
  });

  // === Detail panel ==================================================
  //
  // While a session is open, we also track which slice of its event
  // timeline is currently visible in the detail scroll view. That slice
  // feeds a "cursor" overlay on the main timeline so the audience can
  // see where in the session they are as they scroll the log.

  let detailEl: HTMLDivElement | null = $state(null);
  let viewportStartT = $state(0);
  let viewportEndT = $state(0);
  // Indices of the first and last fully-visible event rows - used both
  // by the timeline cursor (via their t / dur) and by a subtle highlight
  // in the detail panel itself, so it's obvious which rows are feeding
  // the cursor's in / out markers.
  let viewportFirstIdx = $state(-1);
  let viewportLastIdx = $state(-1);

  function updateDetailViewport() {
    if (!selectedSession || !detailEl) return;
    const events = selectedSession.events;
    const rows = detailEl.querySelectorAll<HTMLDivElement>(':scope > .ev');
    if (rows.length === 0) {
      viewportStartT = 0;
      viewportEndT = selectedSession.durationMs;
      viewportFirstIdx = -1;
      viewportLastIdx = -1;
      return;
    }

    // Use getBoundingClientRect() on both the container and each row so
    // the comparison happens in screen-coord space. This sidesteps the
    // offsetParent / offsetTop confusion that arises because the whole
    // segment sits inside a CSS transform (the camera), which breaks the
    // assumption that offsetTop is measured from the scroll container.
    const containerRect = detailEl.getBoundingClientRect();
    const vTop = containerRect.top;
    const vBot = containerRect.bottom;

    let firstFullyVisible = -1;
    let lastFullyVisible = -1;
    const EPS = 0.5;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i].getBoundingClientRect();
      if (r.top + EPS >= vTop && r.bottom - EPS <= vBot) {
        if (firstFullyVisible === -1) firstFullyVisible = i;
        lastFullyVisible = i;
      }
    }

    // Fallback when no row is fully visible (single row taller than
    // the panel): use the first and last rows that overlap the viewport.
    if (firstFullyVisible === -1) {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i].getBoundingClientRect();
        if (r.bottom > vTop) {
          firstFullyVisible = i;
          break;
        }
      }
      for (let i = rows.length - 1; i >= Math.max(0, firstFullyVisible); i--) {
        const r = rows[i].getBoundingClientRect();
        if (r.top < vBot) {
          lastFullyVisible = i;
          break;
        }
      }
    }

    const first = events[firstFullyVisible];
    const last = events[lastFullyVisible];
    if (!first || !last) {
      viewportStartT = 0;
      viewportEndT = selectedSession.durationMs;
      viewportFirstIdx = -1;
      viewportLastIdx = -1;
      return;
    }
    viewportStartT = Math.max(0, first.t - first.dur);
    viewportEndT = last.t;
    viewportFirstIdx = firstFullyVisible;
    viewportLastIdx = lastFullyVisible;
  }

  // Recompute the viewport whenever the selection changes (after the
  // detail panel has actually mounted / its new content is laid out).
  $effect(() => {
    selectedId;
    tick().then(() => {
      // Reset scroll to top for each new selection so the cursor starts
      // at the beginning of the session.
      if (detailEl) detailEl.scrollTop = 0;
      updateDetailViewport();
    });
  });

  function fmtEventTime(session: AuditSession, e: AuditEvent): string {
    const d = new Date(session.startMs + e.t);
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  function closeDetail() {
    selectedId = null;
  }

  // Hovered session metadata (for tooltip)
  const hoveredSession = $derived(
    hoverId ? AUDIT_DATA.sessions.find((s) => s.id === hoverId) ?? null : null,
  );
</script>

<div class="aud-root" data-segment-root>
  <header class="segment-header">
    <span class="eyebrow">Transparency, live</span>
    <h1 class="headline-gradient">The audit of this talk</h1>
    <p class="subhead">
      Every session that built this presentation. Every prompt, every
      AI turn, every file touched. Zoom with the mouse wheel. Click a
      session to open its log.
    </p>
  </header>

  <div class="viz" class:split={selectedId != null}>
    <div class="timeline-panel">
      <div class="tl-wrapper" bind:this={wrapperEl}>
        <canvas
          bind:this={canvasEl}
          onwheel={onWheel}
          onpointerdown={onPointerDown}
          onpointermove={onPointerMove}
          onpointerup={onPointerUp}
          onpointerleave={onPointerLeave}
        ></canvas>
        {#if hoveredSession && !isPanning}
          <div class="tooltip">
            <div class="tt-title">{hoveredSession.title}</div>
            <div class="tt-meta">
              <span>{fmtDateTime(hoveredSession.startMs)}</span>
              <span>·</span>
              <span>{fmtDuration(hoveredSession.durationMs)}</span>
              <span>·</span>
              <span>
                {hoveredSession.stats.user} human ·
                {hoveredSession.stats.assistant} ai ·
                {hoveredSession.stats.tools} tool
              </span>
            </div>
            <div class="tt-hint">click to open the log</div>
          </div>
        {/if}
      </div>

      <div class="legend">
        <span class="lg-item"><span class="lg-dot human"></span>Human prompt</span>
        <span class="lg-item"><span class="lg-dot ai"></span>AI reply</span>
        <span class="lg-item"><span class="lg-dot think"></span>Thinking</span>
        <span class="lg-item"><span class="lg-dot tool"></span>Tool use</span>
        <span class="lg-hint">scroll to zoom · drag to pan · click a session</span>
      </div>
    </div>

    {#if selectedSession}
      <div class="detail-panel">
        <div class="dp-head">
          <div class="dp-head-meta">
            <span class="dp-date">{fmtDateTime(selectedSession.startMs)}</span>
            <span class="dp-dot">·</span>
            <span class="dp-duration">{fmtDuration(selectedSession.durationMs)}</span>
            <span class="dp-dot">·</span>
            <span class="dp-stats">
              {selectedSession.stats.user}U ·
              {selectedSession.stats.assistant}A ·
              {selectedSession.stats.tools}T
            </span>
          </div>
          <button class="dp-close" onclick={closeDetail} aria-label="Close detail">×</button>
        </div>
        <div class="dp-title">{selectedSession.title}</div>
        <div class="dp-body" bind:this={detailEl} onscroll={updateDetailViewport}>
          {#each selectedSession.events as e, i (i)}
            <div
              class="ev"
              data-kind={e.kind}
              class:in-cursor={i >= viewportFirstIdx && i <= viewportLastIdx && viewportFirstIdx !== -1}
            >
              <span class="ev-time">{fmtEventTime(selectedSession, e)}</span>
              <span class="ev-tag" data-kind={e.kind}>
                {#if e.kind === 'user'}user{/if}
                {#if e.kind === 'assistant'}ai{/if}
                {#if e.kind === 'thinking'}think{/if}
                {#if e.kind === 'tool'}tool{/if}
              </span>
              <span class="ev-dur">{fmtShortDur(e.dur)}</span>
              <span class="ev-text">
                {#if e.kind === 'tool'}
                  <span class="ev-tool">{e.tool}</span>
                  {#if e.label}<span class="ev-tool-label">{e.label}</span>{/if}
                {:else if e.kind === 'thinking' && e.redacted}
                  <span class="ev-redacted">
                    (thinking · content not retained — only a cryptographic signature is preserved in the transcript)
                  </span>
                {:else}
                  {e.text}
                {/if}
              </span>
            </div>
          {/each}
          <div class="dp-footer">
            end of session · {selectedSession.events.length} entries
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .aud-root {
    width: 100%;
    height: 100%;
    padding: 72px 80px 48px 80px;
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 32px;
    overflow: hidden;
  }

  .segment-header {
    max-width: 1500px;
  }

  .eyebrow {
    display: inline-block;
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    margin-bottom: 14px;
  }

  h1 {
    font-family: var(--font-sans);
    font-size: 76px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1.1;
    padding-bottom: 0.08em;
    margin: 0;
  }

  .subhead {
    margin-top: 14px;
    font-size: 24px;
    line-height: 1.5;
    color: var(--color-text-muted);
    max-width: 48em;
  }

  /* === Viz area ===================================================== */

  .viz {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    min-height: 0;
    transition: grid-template-columns 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .viz.split {
    grid-template-columns: 1fr 1fr;
  }

  /* CSS Grid defaults grid items to `min-width: auto`, which means they
     refuse to shrink below their content's min-content size. With a fixed
     canvas inside, that would pin the timeline-panel at full width and
     leave the detail-panel a sliver. Explicit `min-width: 0` lets the
     grid actually divide space. */
  .timeline-panel,
  .detail-panel {
    min-width: 0;
  }

  .timeline-panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0;
  }

  .tl-wrapper {
    position: relative;
    flex: 1;
    min-height: 0;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background: rgba(0, 0, 0, 0.35);
    overflow: hidden;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    cursor: grab;
    touch-action: none;
  }

  canvas:active {
    cursor: grabbing;
  }

  .tooltip {
    position: absolute;
    top: 18px;
    left: 18px;
    max-width: 580px;
    padding: 12px 18px;
    background: rgba(11, 11, 20, 0.88);
    border: 1px solid var(--color-tool-border);
    border-radius: 10px;
    backdrop-filter: blur(6px);
    pointer-events: none;
    box-shadow: 0 12px 48px -16px rgba(0, 0, 0, 0.6);
  }

  .tt-title {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: 6px;
    line-height: 1.35;
  }

  .tt-meta {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--color-text-muted);
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .tt-hint {
    margin-top: 8px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-ai-mid);
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--color-text-muted);
  }

  .lg-item {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .lg-dot {
    width: 14px;
    height: 4px;
    border-radius: 2px;
  }

  .lg-dot.human {
    background: rgba(52, 211, 153, 0.95);
  }
  .lg-dot.ai {
    background: rgba(236, 72, 153, 0.9);
  }
  .lg-dot.think {
    background: rgba(200, 200, 220, 0.5);
  }
  .lg-dot.tool {
    background: rgba(96, 165, 250, 0.95);
  }

  .lg-hint {
    margin-left: auto;
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  /* === Detail panel ================================================== */

  .detail-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    background: rgba(11, 11, 20, 0.6);
    overflow: hidden;
    animation: panel-in 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }

  @keyframes panel-in {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .dp-head {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 22px;
    border-bottom: 1px solid var(--color-border);
    background: rgba(0, 0, 0, 0.35);
  }

  .dp-head-meta {
    display: flex;
    gap: 10px;
    align-items: baseline;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--color-text-muted);
    flex-wrap: wrap;
    flex: 1;
  }

  .dp-date {
    color: var(--color-text);
  }

  .dp-dot {
    color: var(--color-text-subtle);
  }

  .dp-stats {
    color: var(--color-ai-mid);
  }

  .dp-close {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .dp-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text);
  }

  .dp-title {
    padding: 14px 22px 12px;
    font-size: 22px;
    line-height: 1.35;
    color: var(--color-text);
    border-bottom: 1px solid var(--color-border);
    background: rgba(0, 0, 0, 0.25);
  }

  .dp-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px 22px 24px;
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.55;
    color: var(--color-text);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  }

  .dp-body::-webkit-scrollbar {
    width: 10px;
  }
  .dp-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 5px;
  }
  .dp-body::-webkit-scrollbar-track {
    background: transparent;
  }

  /* === Event rows - Claude-Code-like output ========================= */

  .ev {
    display: grid;
    grid-template-columns: 72px 60px 70px 1fr;
    gap: 14px;
    padding: 6px 0;
    align-items: baseline;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.04);
  }

  .ev-dur {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    color: var(--color-text-subtle);
    text-align: right;
  }

  .ev:last-of-type {
    border-bottom: none;
  }

  /* Rows feeding the cursor's in/out markers get a subtle magenta wash.
     This is a diagnostic aid - if the cursor on the timeline ever looks
     off, the highlighted rows reveal exactly what is being measured. */
  .ev.in-cursor {
    background: rgba(236, 72, 153, 0.08);
    box-shadow: inset 2px 0 0 0 rgba(236, 72, 153, 0.55);
    padding-left: 6px;
  }

  .ev-time {
    color: var(--color-text-subtle);
    font-size: 12px;
    letter-spacing: 0.04em;
  }

  .ev-tag {
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    text-align: center;
    padding: 3px 0;
    border-radius: 9999px;
  }

  .ev-tag[data-kind='user'] {
    background: rgba(52, 211, 153, 0.12);
    color: var(--color-human);
    border: 1px solid rgba(52, 211, 153, 0.3);
  }
  .ev-tag[data-kind='assistant'] {
    background: rgba(236, 72, 153, 0.12);
    color: var(--color-ai-mid);
    border: 1px solid rgba(236, 72, 153, 0.3);
  }
  .ev-tag[data-kind='thinking'] {
    background: rgba(200, 200, 220, 0.06);
    color: var(--color-text-subtle);
    border: 1px solid rgba(200, 200, 220, 0.15);
  }
  .ev-tag[data-kind='tool'] {
    background: rgba(96, 165, 250, 0.12);
    color: rgb(147, 197, 253);
    border: 1px solid rgba(96, 165, 250, 0.3);
  }

  .ev-text {
    color: var(--color-text);
    word-break: break-word;
    white-space: pre-wrap;
  }

  .ev[data-kind='thinking'] .ev-text {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .ev-redacted {
    color: var(--color-text-subtle);
    font-style: italic;
    opacity: 0.85;
  }

  .ev[data-kind='assistant'] .ev-text {
    color: var(--color-text);
  }

  .ev-tool {
    color: rgb(147, 197, 253);
    font-weight: 500;
    margin-right: 10px;
  }

  .ev-tool-label {
    color: var(--color-text);
    background: rgba(0, 0, 0, 0.35);
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--color-code-border);
  }

  .dp-footer {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--color-border);
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    text-align: center;
  }
</style>
