import type { Component } from 'svelte';

// === Camera ===

export interface CameraTarget {
  x: number;
  y: number;
  zoom: number;
}

export interface AnimationOptions {
  duration?: number;
  ease?: string;
}

// === Canvas Elements ===

export interface CanvasElementConfig {
  id: string;
  x: number;
  y: number;
  scale: number;
  width: number;
  height: number;
  component: string;
  focusComponent?: string;
  label?: string;
  meta?: Record<string, unknown>;
}

// === Walkthrough ===

export interface WalkthroughStep {
  id: string;
  targetElementId?: string;
  x: number;
  y: number;
  zoom: number;
  duration?: number;
  ease?: string;
  pauseDuration?: number;
  label?: string;
}

export interface WalkthroughConfig {
  name: string;
  description?: string;
  steps: WalkthroughStep[];
}

// === Background ===

export type ShapeType = 'circle' | 'blob' | 'ring' | 'line';

export interface BackgroundShape {
  type: ShapeType;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  parallaxFactor: number;
  blur?: number;
  rotation?: number;
}

export interface BackgroundConfig {
  shapes: BackgroundShape[];
}

// === Component Registry ===

export type ComponentLoader = () => Promise<{ default: Component<any> }>;
