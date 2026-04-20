import type {
  CameraTarget,
  PresentationConfig,
  PresentationStep,
  SegmentScript,
} from '$lib/types';
import { camera } from '$lib/camera/camera.svelte';
import { segments } from '$lib/segments/segments.svelte';
import {
  cameraTargetForContextZoom,
  cameraTargetForSegment,
  cameraTargetForZoom,
  scrollYForTarget,
} from '$lib/segments/camera-targets';
import { getStage, resetAllStages } from '$lib/stage/stage-registry';
import { DEFAULTS } from '$lib/constants';

// Navigation model:
// - up/down (stepNext / stepPrev) drives progression within the active segment.
//   Each segment has its own local script; `positions[i]` tracks the last
//   applied step index per segment (-1 = untouched, sitting at segment landing).
// - left/right (switchNext / switchPrev) moves between segments. The camera
//   snapshots the current position on leave, and restores it on return, so
//   round-tripping between segments preserves state.
class WalkthroughEngine {
  scripts = $state<SegmentScript[]>([]);
  activeIndex = $state(0);
  positions = $state<number[]>([]);

  private snapshots: (CameraTarget | null)[] = [];
  private history: CameraTarget[][] = [];
  private running = $state(false);

  get isRunning(): boolean {
    return this.running;
  }

  get activeScript(): SegmentScript | undefined {
    return this.scripts[this.activeIndex];
  }

  get activeSegmentId(): string | null {
    return this.activeScript?.segmentId ?? null;
  }

  get currentStep(): PresentationStep | undefined {
    const script = this.activeScript;
    const pos = this.positions[this.activeIndex];
    if (!script || pos === undefined || pos < 0) return undefined;
    return script.steps[pos];
  }

  get currentIndex(): number {
    return this.positions[this.activeIndex] ?? -1;
  }

  get totalSteps(): number {
    return this.activeScript?.steps.length ?? 0;
  }

  get canStepNext(): boolean {
    return !this.running && this.currentIndex < this.totalSteps - 1;
  }

  get canStepPrev(): boolean {
    return !this.running && this.currentIndex >= 0;
  }

  get canSwitchNext(): boolean {
    return !this.running && this.activeIndex < this.scripts.length - 1;
  }

  get canSwitchPrev(): boolean {
    return !this.running && this.activeIndex > 0;
  }

  load(config: PresentationConfig) {
    this.scripts = config.scripts;
    this.positions = config.scripts.map(() => -1);
    this.snapshots = config.scripts.map(() => null);
    this.history = config.scripts.map(() => []);
    this.activeIndex = 0;
    resetAllStages();

    // Land camera on the first segment.
    const script = this.scripts[0];
    if (script) {
      const seg = segments.get(script.segmentId);
      if (seg) {
        camera.jumpTo(cameraTargetForSegment(seg));
      }
    }
  }

  async stepNext() {
    if (!this.canStepNext) return;
    this.running = true;
    const idx = this.activeIndex;
    const script = this.scripts[idx];
    const newPos = this.positions[idx] + 1;
    const step = script.steps[newPos];
    this.history[idx][newPos] = {
      x: camera.x,
      y: camera.y,
      zoom: camera.zoom,
    };
    this.positions[idx] = newPos;
    await this.applyStep(step);
    this.running = false;
  }

  async stepPrev() {
    if (!this.canStepPrev) return;
    this.running = true;
    const idx = this.activeIndex;
    const script = this.scripts[idx];
    const pos = this.positions[idx];
    const step = script.steps[pos];
    const preState = this.history[idx][pos];
    await this.undoStep(step, preState);
    this.positions[idx] = pos - 1;
    this.running = false;
  }

  async switchNext() {
    if (!this.canSwitchNext) return;
    await this.switchTo(this.activeIndex + 1);
  }

  async switchPrev() {
    if (!this.canSwitchPrev) return;
    await this.switchTo(this.activeIndex - 1);
  }

  private async switchTo(newIndex: number) {
    this.running = true;
    this.snapshots[this.activeIndex] = {
      x: camera.x,
      y: camera.y,
      zoom: camera.zoom,
    };
    this.activeIndex = newIndex;

    const script = this.scripts[newIndex];
    const seg = script ? segments.get(script.segmentId) : undefined;
    if (!seg) {
      this.running = false;
      return;
    }
    const snapshot = this.snapshots[newIndex];
    const target = snapshot ?? cameraTargetForSegment(seg);
    await camera.animateTo(target, {
      duration: DEFAULTS.animation.duration,
    });
    this.running = false;
  }

  private async applyStep(step: PresentationStep) {
    if (step.type === 'camera') {
      const seg = segments.get(step.segmentId);
      if (!seg) return;
      const target = step.targetId
        ? this.resolveZoomTarget(seg.id, step.targetId)
        : cameraTargetForSegment(seg);
      if (!target) return;
      await camera.animateTo(target, {
        duration: step.duration,
        ease: step.ease,
      });
    } else if (step.type === 'advance') {
      const ctrl = getStage(step.segmentId);
      ctrl?.advance();
    } else if (step.type === 'context-zoom') {
      const from = segments.get(step.fromSegmentId);
      const to = segments.get(step.toSegmentId);
      if (!from || !to) return;
      const target = cameraTargetForContextZoom(from, to);
      await camera.animateTo(target, {
        duration: step.duration,
        ease: step.ease,
      });
    } else if (step.type === 'spotlight') {
      const seg = segments.get(step.segmentId);
      if (!seg) return;
      const ctrl = getStage(step.segmentId);
      const runtime = ctrl?.getZoomTargetRect?.(step.targetId);
      const target = runtime
        ? { id: step.targetId, ...runtime }
        : seg.zoomTargets?.find((z) => z.id === step.targetId);
      if (!target) return;
      const y = scrollYForTarget(seg, target);
      await camera.scrollTo(y, {
        duration: step.duration,
        ease: step.ease,
      });
    }
  }

  private async undoStep(step: PresentationStep, preState: CameraTarget | undefined) {
    if (!preState) return;
    if (
      step.type === 'camera' ||
      step.type === 'context-zoom' ||
      step.type === 'spotlight'
    ) {
      await camera.animateTo(preState, {
        duration: step.duration,
        ease: step.ease,
      });
    } else if (step.type === 'advance') {
      const ctrl = getStage(step.segmentId);
      ctrl?.retreat();
    }
  }

  private resolveZoomTarget(
    segmentId: string,
    targetId: string,
  ): CameraTarget | undefined {
    const seg = segments.get(segmentId);
    if (!seg) return undefined;
    const ctrl = getStage(segmentId);
    const runtime = ctrl?.getZoomTargetRect?.(targetId);
    if (runtime) {
      return cameraTargetForZoom(seg, { id: targetId, ...runtime });
    }
    const t = seg.zoomTargets?.find((z) => z.id === targetId);
    if (!t) return undefined;
    return cameraTargetForZoom(seg, t);
  }
}

export const walkthrough = new WalkthroughEngine();
