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
