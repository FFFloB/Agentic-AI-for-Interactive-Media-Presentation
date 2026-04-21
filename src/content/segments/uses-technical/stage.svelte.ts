import type { StageController } from '$lib/types';

// Technical uses segment: 1 framing, 7 use cards, 1 closer, 1 warning.
class UsesTechnicalStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = 10;

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

export const usesTechnicalStage = new UsesTechnicalStage();
