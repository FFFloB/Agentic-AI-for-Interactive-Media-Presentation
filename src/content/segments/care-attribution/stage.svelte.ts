import type { StageController } from '$lib/types';

// "Name your collaborators" - attribution + transparency. Nine stages:
// frame -> short answer -> York -> D&AD -> frame -> IPA/ISBA ->
// how this talk was built (did/did-not) -> transparency I set up for you
// (with real session-log excerpt) -> closer.
class CareAttributionStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = 9;

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

export const careAttributionStage = new CareAttributionStage();
