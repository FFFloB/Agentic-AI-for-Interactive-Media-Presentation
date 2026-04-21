import type { StageController } from '$lib/types';

// "Environmental footprint - the details" - honest numbers with the
// caveats the talk must not skip. Eight reveals.
class CareFootprintStage implements StageController {
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

export const careFootprintStage = new CareFootprintStage();
