# Project Info

## What This Is

An interactive, canvas-based presentation tool. Rather than traditional linear slides, content lives on a large 2D canvas that the viewer navigates through — flying, panning, and zooming between areas of interest.

## Core Concepts

- **Canvas**: A large spatial surface where all presentation elements are placed at specific positions and scales.
- **Scripted Walkthrough**: A predefined sequence of smooth camera movements (pan, zoom) that guides the viewer through the narrative.
- **Interactive Focus**: Any element can be clicked/tapped to expand full-screen with additional detail, independent of the scripted path.
- **Visual Journey**: Abstract generative shapes and patterns in the background create depth through parallax, reinforcing the sense of spatial movement.

## Current Status

Technical platform scaffolded. Working Svelte 5 + Vite application with:
- Camera system (pan/zoom via CSS transforms, animated with GSAP)
- Canvas element positioning and lazy-loaded content components
- Walkthrough engine (declarative step sequence, play/pause/next/prev)
- Focus system (click-to-expand fullscreen overlay with interactive components)
- Generative parallax background (Canvas 2D)
- Keyboard navigation (arrows, spacebar, escape)
- 3 placeholder slides (Title, Intro, Interactive Demo)
