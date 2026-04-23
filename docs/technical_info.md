# Technical Info

## Tech Stack

| Layer | Choice |
|---|---|
| **Framework** | Svelte 5 + TypeScript |
| **Build** | Vite 6 |
| **Animation** | GSAP 3 |
| **Content rendering** | HTML/CSS transforms (camera = CSS transform on a root container) |
| **Background** | Canvas 2D API with parallax |

## Architecture

### Component Hierarchy

```
App.svelte
  BackgroundCanvas        (z-0: canvas 2D generative shapes with parallax)
  CameraViewport          (z-1: CSS-transformed container for all content)
    CanvasLayer
      CanvasElement[]     (positioned wrappers, each renders a Svelte component)
  FocusOverlay            (z-2: fullscreen overlay when an element is focused)
  WalkthroughControls     (z-3: play/pause/step UI)
  KeyboardHandler         (invisible, keyboard shortcuts)
```

### Camera System

The camera is a `$state` class (`camera.svelte.ts`) with `x`, `y`, `zoom` properties. GSAP animates these properties directly — because they're Svelte 5 runes, reactivity re-renders the CSS transform binding on `CameraViewport` automatically.

### Content Model

- Canvas elements are positioned via absolute CSS transforms at world-space `(x, y, scale)`
- Content components are lazy-loaded from a registry using dynamic `import()`
- Walkthrough is pure declarative data (array of camera targets) defined in `walkthrough.config.ts`
- Each content component can have a `focusComponent` variant for expanded interactive view

### Focus System

Clicking a canvas element opens a fullscreen overlay (`FocusOverlay`) that dynamically loads and renders the element's focused component with `isFocused={true}`. Escape or close button dismisses it.

## Directory Structure

```
src/
  app.ts                          Entry point
  app.css                         Global styles, CSS variables
  App.svelte                      Root component
  lib/
    types.ts                      All TypeScript interfaces
    constants.ts                  Default values
    camera/                       Camera state + viewport container
    canvas/                       CanvasElement + CanvasLayer
    focus/                        Focus state + overlay
    walkthrough/                  Walkthrough engine + controls
    background/                   Canvas 2D renderer + shapes
    ui/                           KeyboardHandler
  content/
    elements.ts                   Component registry (dynamic imports)
    slides.config.ts              Element positions on canvas
    walkthrough.config.ts         Walkthrough sequence
    slides/                       Content components
```

## Patterns & Guides

- **State management**: Module-level `$state` class singletons (no stores, no context). Import and use directly.
- **GSAP integration**: GSAP tweens `$state` properties on plain class instances. Svelte reactivity handles re-rendering.
- **Component loading**: Dynamic `import()` via a registry map. Vite auto-splits each content component into its own chunk.
- **Content authoring**: Define element positions in `slides.config.ts`, walkthrough order in `walkthrough.config.ts`, register components in `elements.ts`.

## Live Status Indicator (Presenter-Only)

A top-right indicator (`src/lib/ui/StatusIndicator.svelte`) shows what the AI assistant is currently doing during a live demo: `ready` (green), `working` (amber, slow pulse), `input needed` (pink, fast pulse).

**Wiring:**
- `scripts/status-bridge.mjs` is a zero-dep Node SSE server on `127.0.0.1:7321`.
- Start it alongside the dev server: `npm run dev:bridge`.
- Assistant hooks (configured in `.claude/settings.local.json`, git-ignored) POST to `/status/{ready|working|input-needed}` on `UserPromptSubmit`, `Stop`, and `Notification`.
- The UI subscribes to `/events` via SSE. If the bridge isn't reachable on first connect, the indicator hides permanently for that page load - the compiled single-file HTML shows nothing on student machines.

## Pending Revisions

Design-pass on 2026-04-20 (see `key_decisions.md` #5-#10) introduced criteria not yet reflected in code. Planned changes:

- **Canvas layout**: move from free 2D positions in `slides.config.ts` to a left-to-right ribbon model where segments are laid out sequentially and each segment has its own vertical extent. Segment-local coordinates (rather than a single world space) may simplify scroll + zoom authoring.
- **Zoom targets**: extend the segment/slide config to declare named zoom targets per segment. The camera system accepts these as discrete destinations (no free zoom).
- **Focus system**: replace `FocusOverlay` chrome with a seamless camera-zoom-to-element. Interactive components stop being rendered inside an overlay; instead, the same canvas-mounted component becomes interactive when its zoom target fills the viewport. Exit is driven by the presentation script, not a close button.
- **Walkthrough engine**: extend the flat step list in `walkthrough.config.ts` so each step is either a camera move *or* a segment-internal advance. One advance control (click/space) drives both. This likely means segments expose an advance hook that the engine can invoke.
- **Segment staging**: segments that pre-stage (like the agentic chat brief in `content_briefs.md`) need a local "stage index" state and auto-scroll-to-newest behavior during staging, with free scroll unlocking after the last stage.
- **Inter-segment context transition**: an optional transition type that zooms out to reveal adjacent segments before landing on the next one.
- **Typography & color**: pin headline gradient palette and base dark; apply Inter Semi Bold (or equivalent) across the app.
- **Performance**: explicitly deferred. Expect many DOM elements and tall scroll regions to be mounted simultaneously.
