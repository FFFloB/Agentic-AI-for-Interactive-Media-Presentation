# Key Decisions

## Decision Log

### 1. Canvas-based spatial presentation model
**Date**: 2026-02-26
**Decision**: Use a 2D canvas/spatial layout rather than traditional linear slides.
**Rationale**: Supports a more immersive, non-linear storytelling experience. Allows spatial relationships between content to carry meaning.

### 2. Dual interaction mode — scripted + interactive
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
