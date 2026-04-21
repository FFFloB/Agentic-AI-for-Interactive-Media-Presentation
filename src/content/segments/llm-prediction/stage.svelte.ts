import type { StageController, ZoomTargetRect } from '$lib/types';

// Stages mirror the chat segment's structure: step-by-step reveal of
// bubbles and cards. The narrative lands in three beats:
//   1. Token-level prediction demo (stages 1-4)
//   2. Transition + short dialog forming (stages 5-8)
//   3. Context view: what the model reads on its next prediction,
//      including its own prior reply (stages 9-10)
class LlmPredictionStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = 10;

  private rects = $state<Record<string, ZoomTargetRect>>({});

  advance(): boolean {
    if (this.stageIndex < this.maxStage) {
      this.stageIndex++;
      return true;
    }
    return false;
  }

  retreat(): boolean {
    if (this.stageIndex > 0) {
      this.stageIndex--;
      return true;
    }
    return false;
  }

  reset() {
    this.stageIndex = 0;
  }

  reveal(atStage: number): boolean {
    return this.stageIndex >= atStage;
  }

  registerRect(id: string, rect: ZoomTargetRect) {
    this.rects[id] = rect;
  }

  getZoomTargetRect(id: string): ZoomTargetRect | undefined {
    return this.rects[id];
  }
}

export const llmStage = new LlmPredictionStage();
