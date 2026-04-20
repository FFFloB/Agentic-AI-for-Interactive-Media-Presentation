import type { StageController, ZoomTargetRect } from '$lib/types';

class ChatStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = 19;

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

export const chatStage = new ChatStage();
