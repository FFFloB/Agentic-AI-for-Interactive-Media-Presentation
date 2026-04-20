# Design Guide

## Visual Identity

- **Simple and striking** - full-screen, space-efficient layouts per segment. Never cramp content; reveal progressively via scroll or zoom.
- **Dark background, white body text** - generous whitespace, minimal chrome.
- **Gradient headlines** - vibrant color gradients for titles; body text white (or near-white) on dark.

## Typography

- **Headlines**: Inter Semi Bold (or a similar iconic geometric sans-serif - Satoshi, General Sans). Vibrant gradient fill.
- **Body**: Same family, regular weight, white or near-white on dark.
- Variable weight support preferred. Excellent screen readability is mandatory.

## Color

- Base: deep neutral dark (to be pinned; candidates: near-black with a subtle blue or violet bias).
- Headline gradients: vibrant, 2-3 stops. Palette locks once the first segment is designed.
- Accent: sparingly, for interactive affordances and tool-use highlights.

## Layout Principle

- One striking idea per full-screen view.
- Content expands *vertically* within a segment when more must be revealed (scroll).
- Content expands *in depth* within a segment via zoom to authored detail targets.
- Overall sequence flows *left to right* across the canvas.

## Background & Generative Elements

- Soft geometric shapes (circles, blobs, grids, lines), low-opacity, blurred.
- Parallax tied to camera position.
- Must enhance, never distract.

## Navigation & Camera Model

- **Horizontal ribbon**: segments arranged left-to-right; sequence is semantically meaningful.
- **Vertical per-segment**: each segment can be tall; vertical scroll reveals staged content.
- **Discrete zoom targets**: each segment declares named zoom targets (e.g. a tool-call card, a code block). Zoom is not free-form; only authored targets are reachable. Transitions between targets animate smoothly.
- **Inter-segment context transition (optional)**: the camera can zoom out far enough to show prior and upcoming segments with their full scrolled content before landing on the next segment.

## Presentation Script

- A single flat script of steps drives the presentation. Each step is either:
  - A camera move (pan or zoom to a segment or zoom target), or
  - A segment-internal advance (reveal the next pre-staged element).
- One advance control (click or space) drives both. The presenter does not think in modes.

## Scroll Behavior Within a Segment

- During staging animation: auto-scroll to keep the newest-revealed element in view (typically scroll-to-bottom for feed-style content).
- After all staged elements have played out: free vertical scroll unlocks for exploration.

## Interactive Embedding

- Interactive content embeds seamlessly. No focus frame, no overlay chrome, no close button.
- Focusing an interactive element *is* the same motion as zooming to a zoom target: the camera animates to make the element fill the viewport, and at that scale the element becomes interactive.
- Exit is the same mechanism in reverse: advancing the script (or zooming back out) resumes the flow.

## Interaction & Motion

- Smooth easing for all camera transitions (ease-in-out or custom bezier).
- Zoom transitions are continuous and animated even though targets are discrete.
- Subtle hover and focus states for interactive affordances.

## Performance

- Explicitly deferred. Tall scrolled segments (especially pre-staged mini-apps with many elements) will likely become expensive; this is an accepted cost for now and will be revisited later.
