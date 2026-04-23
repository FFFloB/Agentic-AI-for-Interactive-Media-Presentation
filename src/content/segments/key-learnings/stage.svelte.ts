import type { StageController } from '$lib/types';

// "Key learnings" - the closing segment. Not an aggregate of prior beats;
// three new insights that open the talk outward. Five stages: framing ->
// skill 1 (leadership) -> skill 2 (delegation) -> skill 3 (information) ->
// punchline reveal ("this was never about AI"). The punchline lands at
// the end, not upfront.
class KeyLearningsStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = 5;

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

export const keyLearningsStage = new KeyLearningsStage();
