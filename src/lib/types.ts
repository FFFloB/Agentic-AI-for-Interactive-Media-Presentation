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

// === Segments ===

export interface ZoomTarget {
  id: string;
  xOffset: number;
  yOffset: number;
  width: number;
  height: number;
  label?: string;
}

export interface SegmentConfig {
  id: string;
  width: number;
  height: number;
  component: string;
  label?: string;
  zoomTargets?: ZoomTarget[];
  meta?: Record<string, unknown>;
}

export interface PlacedSegment extends SegmentConfig {
  xOffset: number;
}

// === Stage Controller ===
//
// Segments that pre-stage content expose a stage controller so the
// walkthrough engine can drive internal state advances from the flat script.

export interface ZoomTargetRect {
  xOffset: number;
  yOffset: number;
  width: number;
  height: number;
}

export interface StageController {
  stageIndex: number;
  maxStage: number;
  advance(): boolean;
  retreat(): boolean;
  reset(): void;
  getZoomTargetRect?(id: string): ZoomTargetRect | undefined;
}

// === Presentation Script (flat) ===

interface StepBase {
  id: string;
  label?: string;
}

export interface CameraStep extends StepBase {
  type: 'camera';
  segmentId: string;
  targetId?: string;
  duration?: number;
  ease?: string;
}

export interface AdvanceStep extends StepBase {
  type: 'advance';
  segmentId: string;
  duration?: number;
  ease?: string;
}

export interface ContextZoomStep extends StepBase {
  type: 'context-zoom';
  fromSegmentId: string;
  toSegmentId: string;
  duration?: number;
  ease?: string;
}

export interface SpotlightStep extends StepBase {
  type: 'spotlight';
  segmentId: string;
  targetId: string;
  duration?: number;
  ease?: string;
}

export type PresentationStep =
  | CameraStep
  | AdvanceStep
  | ContextZoomStep
  | SpotlightStep;

export interface PresentationConfig {
  name: string;
  description?: string;
  steps: PresentationStep[];
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
