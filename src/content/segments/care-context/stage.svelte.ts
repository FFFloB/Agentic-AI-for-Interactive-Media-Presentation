import type { StageController } from '$lib/types';

// "What you put in" - ethics of context engineering. Nine stages:
// framing -> cloud-processing reality (the fact underneath) -> three
// zones -> "your own" permission nuance -> "never" zone -> trap setup ->
// the trap -> thesis scenario -> closer.
class CareContextStage implements StageController {
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

export const careContextStage = new CareContextStage();
