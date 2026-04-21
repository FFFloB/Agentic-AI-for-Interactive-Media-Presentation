import type { StageController } from '$lib/types';

// "The agreement trap" - mechanical limit. AI tries to please;
// style-prompt pushback back in.
class CareAgreementStage implements StageController {
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

export const careAgreementStage = new CareAgreementStage();
