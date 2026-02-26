import type { WalkthroughStep } from '$lib/types';
import { camera } from '$lib/camera/camera.svelte';
import { DEFAULTS } from '$lib/constants';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class WalkthroughEngine {
  steps = $state<WalkthroughStep[]>([]);
  currentIndex = $state(0);
  isPlaying = $state(false);

  private activeTween: gsap.core.Tween | null = null;
  private abortController: AbortController | null = null;

  get currentStep(): WalkthroughStep | undefined {
    return this.steps[this.currentIndex];
  }

  get progress(): number {
    return this.steps.length > 1
      ? this.currentIndex / (this.steps.length - 1)
      : 0;
  }

  get totalSteps(): number {
    return this.steps.length;
  }

  get canGoNext(): boolean {
    return this.currentIndex < this.steps.length - 1;
  }

  get canGoPrev(): boolean {
    return this.currentIndex > 0;
  }

  load(steps: WalkthroughStep[]) {
    this.stop();
    this.steps = steps;
    this.currentIndex = 0;

    if (steps.length > 0) {
      camera.jumpTo({
        x: steps[0].x,
        y: steps[0].y,
        zoom: steps[0].zoom,
      });
    }
  }

  async goToStep(index: number) {
    if (index < 0 || index >= this.steps.length) return;

    this.activeTween?.kill();
    this.currentIndex = index;
    const step = this.steps[index];

    this.activeTween = camera.animateTo(
      { x: step.x, y: step.y, zoom: step.zoom },
      { duration: step.duration, ease: step.ease },
    );

    await this.activeTween;
  }

  async next() {
    if (this.canGoNext) {
      await this.goToStep(this.currentIndex + 1);
    }
  }

  async prev() {
    if (this.canGoPrev) {
      await this.goToStep(this.currentIndex - 1);
    }
  }

  async play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.abortController = new AbortController();

    while (this.isPlaying && this.canGoNext) {
      await this.goToStep(this.currentIndex + 1);
      if (!this.isPlaying) break;

      const pause =
        this.currentStep?.pauseDuration ?? DEFAULTS.walkthrough.pauseDuration;
      if (pause > 0) {
        await delay(pause);
      }
    }

    this.isPlaying = false;
    this.abortController = null;
  }

  pause() {
    this.isPlaying = false;
    this.activeTween?.pause();
  }

  stop() {
    this.isPlaying = false;
    this.activeTween?.kill();
    this.activeTween = null;
    this.abortController?.abort();
    this.abortController = null;
  }
}

export const walkthrough = new WalkthroughEngine();
