# Key Decisions

## Decision Log

### 1. Canvas-based spatial presentation model
**Date**: 2026-02-26
**Decision**: Use a 2D canvas/spatial layout rather than traditional linear slides.
**Rationale**: Supports a more immersive, non-linear storytelling experience. Allows spatial relationships between content to carry meaning.
**Note (2026-04-20)**: Refined by Decision #5. The canvas is still spatial, but ordering is now a left-to-right ribbon with vertical per-segment expansion rather than free 2D navigation.

### 2. Dual interaction mode - scripted + interactive
**Date**: 2026-02-26
**Decision**: Support both a scripted walkthrough (automated camera path) and free interactive exploration (click to focus/expand elements).
**Rationale**: Gives the presenter control over narrative flow while allowing audience members to explore on their own.

### 3. Tech stack: Svelte 5, Vite, GSAP, HTML/CSS transforms
**Date**: 2026-02-26
**Decision**: Use Svelte 5 + TypeScript for the framework, Vite for build, GSAP for animation, and HTML/CSS transforms for the camera/content layer with a Canvas 2D API layer for generative backgrounds.
**Rationale**: Svelte 5's rune-based reactivity pairs naturally with GSAP (animate $state properties, Svelte re-renders automatically). HTML/CSS transforms keep content as real DOM elements (crisp text, accessibility, interactive widgets when focused). Canvas 2D is used only for decorative parallax backgrounds where per-shape DOM nodes aren't needed. Vite provides fast HMR and code-splitting. The lightweight footprint suits a focused presentation tool.

### 4. Documentation-driven development
**Date**: 2026-02-26
**Decision**: Maintain living documentation (`project_info.md`, `technical_info.md`, `design_guide.md`, `key_decisions.md`, `key_learnings.md`) alongside a contribution log in `CLAUDE.md`.
**Rationale**: Ensures clarity on what was built, why, and by whom. Supports effective human-AI collaboration.

### 5. Horizontal sequential canvas (refines Decision #1)
**Date**: 2026-04-20
**Decision**: The canvas is a left-to-right ribbon of segments. Vertical space is used for per-segment content expansion (scrolling). Free 2D navigation is dropped.
**Rationale**: Sequence carries narrative meaning; the audience should not get lost. Horizontal ordering plus vertical expansion gives a clear mental model while preserving spatial affordances. Simpler to author and easier to follow.

### 6. Authored discrete zoom targets (no free zoom)
**Date**: 2026-04-20
**Decision**: Each segment declares named zoom targets. Zoom is only reachable at those targets; transitions between them animate smoothly. No free-form user zoom.
**Rationale**: Keeps camera choreography deterministic, keeps the presentation script coherent, and lets the designer compose each detail view deliberately.

### 7. Seamless interactive embedding (no focus overlay chrome)
**Date**: 2026-04-20
**Decision**: Replace the current `FocusOverlay` chrome (frame + close button) with a seamless camera-zoom to the element. At full scale the element is simply interactive. Exit is via the same script or camera mechanism.
**Rationale**: The current overlay break is too harsh and feels like leaving the presentation. Interactive content should feel like a first-class slide.

### 8. Unified navigation primitive (flat script)
**Date**: 2026-04-20
**Decision**: The presentation is a flat script of steps. Each step is either a camera move or a segment-internal advance. One advance control drives both.
**Rationale**: The presenter should not have to think about modes. Keeping navigation uniform avoids fumbling during live delivery.

### 9. Inter-segment context-zoom transition (optional)
**Date**: 2026-04-20
**Decision**: Support a transition mode where the camera zooms out far enough to show prior and upcoming segments (with their full scrolled content visible) before landing on the next segment.
**Rationale**: Reinforces spatial continuity and gives the audience a sense of where the narrative is heading.

### 10. Performance optimization deferred
**Date**: 2026-04-20
**Decision**: Do not optimize for the render cost of tall scrolled segments or many simultaneously-mounted elements. Correctness and feel take priority for now.
**Rationale**: The design pass is exploratory; premature optimization would constrain it. Revisit once segment inventory is concrete.
