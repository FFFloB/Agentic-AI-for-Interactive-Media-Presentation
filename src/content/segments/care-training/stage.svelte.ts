import type { StageController } from '$lib/types';

// "Copyright" - using AI without stealing someone else's work.
// Seven stages: frame -> how training works + "stealing" debate ->
// basic rule -> three zones -> traps -> indemnity -> closer.
class CareTrainingStage implements StageController {
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

export const careTrainingStage = new CareTrainingStage();
