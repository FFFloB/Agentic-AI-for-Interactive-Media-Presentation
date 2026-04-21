import type { StageController } from '$lib/types';

// "Human-AI co-creation, in numbers" - the quantitative bookend to the
// audit timeline. Eight reveals.
class CareNumbersStage implements StageController {
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

export const careNumbersStage = new CareNumbersStage();
