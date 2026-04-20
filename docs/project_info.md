# Project Info

## What This Is

An interactive, canvas-based presentation tool. Rather than traditional linear slides, content lives on a spatial canvas arranged as a left-to-right ribbon of segments. Each segment is full-screen, can expand vertically for long-form content, and declares authored zoom targets for revealing detail. The viewer (or presenter) moves through the ribbon via smooth camera motion.

## Core Concepts

- **Canvas**: A spatial surface arranged as a left-to-right ribbon of segments. Each segment can expand vertically with scrollable content and has authored zoom targets.
- **Presentation Script**: A flat sequence of steps. Each step is either a camera move (pan to next segment, zoom to a detail target) or a segment-internal advance (reveal the next pre-staged element). One advance control drives both.
- **Interactive Focus**: Interactive elements are reached by zooming to them. At full scale they simply become interactive - no overlay, no chrome. Exit is the same motion in reverse.
- **Zoom**: Discrete, authored targets per segment. Transitions are smooth and animated.
- **Scroll**: During staging, auto-scroll keeps the newest element in view; after staging, free vertical scroll unlocks.
- **Inter-segment transition (optional)**: The camera can zoom out to show prior and upcoming segments with full content before landing.
- **Visual Journey**: Generative parallax backgrounds reinforce spatial movement across the ribbon.

## Current Status

Technical platform scaffolded. Working Svelte 5 + Vite application with:
- Camera system (pan/zoom via CSS transforms, animated with GSAP)
- Canvas element positioning and lazy-loaded content components
- Walkthrough engine (declarative step sequence, play/pause/next/prev)
- Focus system (fullscreen overlay with interactive components) - **to be replaced** with seamless camera-zoom per Decision #7
- Generative parallax background (Canvas 2D)
- Keyboard navigation (arrows, spacebar, escape)
- 3 placeholder slides (Title, Intro, Interactive Demo)

Next design-alignment work is tracked in `technical_info.md` under "Pending Revisions".
