import type { StageController } from '$lib/types';

// Design uses segment: 1 framing, 4 use cards, 1 dare card, 1 closer.
class UsesDesignStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = 7;

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
}

export const usesDesignStage = new UsesDesignStage();
