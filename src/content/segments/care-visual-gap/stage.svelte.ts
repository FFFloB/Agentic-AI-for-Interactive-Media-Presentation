import type { StageController } from '$lib/types';

// "The visual gap" - mechanical limit. The agent can observe a UI but
// cannot experience one. Six stages: framing -> what it can do ->
// what sampling misses -> code-vs-visual contrast -> workflow rubric -> closer.
class CareVisualGapStage implements StageController {
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

export const careVisualGapStage = new CareVisualGapStage();
