import type { StageController } from '$lib/types';

// "Ownership" - is what you ship defensibly yours?
// Five stages: frame -> three scenarios -> the test -> decision rubric -> closer.
class CareOwnershipStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = 5;

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

export const careOwnershipStage = new CareOwnershipStage();
