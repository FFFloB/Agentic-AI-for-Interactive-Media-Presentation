import type { StageController } from '$lib/types';

// "Who owns this?" - copyrightability + authorship of AI-assisted work.
class CareOwnershipStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = 6;

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
