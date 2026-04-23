import type { StageController } from '$lib/types';

// "The agreement trap" - mechanical limit. Seven stages: framing ->
// failure in slow motion -> why -> three practices (compact) ->
// memory-file example -> default vs critical comparison -> closer.
class CareAgreementStage implements StageController {
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

export const careAgreementStage = new CareAgreementStage();
