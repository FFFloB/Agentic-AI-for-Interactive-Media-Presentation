import type { CameraTarget, PresentationStep } from '$lib/types';
import { camera } from '$lib/camera/camera.svelte';
import { segments } from '$lib/segments/segments.svelte';
import {
  cameraTargetForContextZoom,
  cameraTargetForSegment,
  cameraTargetForZoom,
  scrollYForTarget,
} from '$lib/segments/camera-targets';
import { getStage, resetAllStages } from '$lib/stage/stage-registry';

class WalkthroughEngine {
  steps = $state<PresentationStep[]>([]);
  currentIndex = $state(-1);
  isRunning = $state(false);
  activeSegmentId = $state<string | null>(null);

  private history: CameraTarget[] = [];

  get totalSteps(): number {
    return this.steps.length;
  }

  get canGoNext(): boolean {
    return !this.isRunning && this.currentIndex < this.steps.length - 1;
  }

  get canGoPrev(): boolean {
    return !this.isRunning && this.currentIndex >= 0;
  }

  get currentStep(): PresentationStep | undefined {
    return this.steps[this.currentIndex];
  }

  load(steps: PresentationStep[]) {
    this.steps = steps;
    this.currentIndex = -1;
    this.history = [];
    this.activeSegmentId = null;
    resetAllStages();

    // Land the camera on the first reachable segment so the initial view is not blank.
    const firstSegmentStep = steps.find(
      (s): s is Extract<PresentationStep, { type: 'camera' }> =>
        s.type === 'camera',
    );
    if (firstSegmentStep) {
      const seg = segments.get(firstSegmentStep.segmentId);
      if (seg) {
        const target = firstSegmentStep.targetId
          ? cameraTargetForZoom(
              seg,
              seg.zoomTargets!.find((t) => t.id === firstSegmentStep.targetId)!,
            )
          : cameraTargetForSegment(seg);
        camera.jumpTo(target);
        this.activeSegmentId = firstSegmentStep.segmentId;
      }
    }
  }

  async next() {
    if (!this.canGoNext) return;
    this.isRunning = true;
    const nextIndex = this.currentIndex + 1;
    const step = this.steps[nextIndex];
    this.history[nextIndex] = {
      x: camera.x,
      y: camera.y,
      zoom: camera.zoom,
    };
    this.currentIndex = nextIndex;
    await this.apply(step);
    this.isRunning = false;
  }

  async prev() {
    if (!this.canGoPrev) return;
    this.isRunning = true;
    const step = this.steps[this.currentIndex];
    const preState = this.history[this.currentIndex];
    await this.undo(step, preState);
    this.currentIndex--;
    this.isRunning = false;
  }

  private async apply(step: PresentationStep) {
    if (step.type === 'camera') {
      const seg = segments.get(step.segmentId);
      if (!seg) return;
      this.activeSegmentId = seg.id;
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
      this.activeSegmentId = step.segmentId;
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
      this.activeSegmentId = seg.id;

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

  private async undo(step: PresentationStep, preState: CameraTarget | undefined) {
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

  private resolveZoomTarget(segmentId: string, targetId: string): CameraTarget | undefined {
    const seg = segments.get(segmentId);
    if (!seg) return undefined;

    // Prefer runtime-measured rect from the segment's stage controller.
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
