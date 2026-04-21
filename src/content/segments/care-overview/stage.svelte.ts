import type { StageController } from '$lib/types';

// "Where care is required" - the overview segment for the closing cluster.
// Four stages: three groups reveal one at a time, then a closing note.
class CareOverviewStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = 4;

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

export const careOverviewStage = new CareOverviewStage();
