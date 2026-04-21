import type { StageController } from '$lib/types';

// "Confidently wrong" - mechanical limit. Plausible but wrong output,
// even with thinking and tools.
class CareWrongStage implements StageController {
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

export const careWrongStage = new CareWrongStage();
