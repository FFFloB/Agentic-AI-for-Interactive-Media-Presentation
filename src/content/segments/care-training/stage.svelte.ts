import type { StageController } from '$lib/types';

// "What went in" - training data provenance + vendor indemnity.
class CareTrainingStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = 8;

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

export const careTrainingStage = new CareTrainingStage();
