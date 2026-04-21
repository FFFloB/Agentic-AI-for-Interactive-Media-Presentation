import type { StageController } from '$lib/types';

// "From prompt engineering to context engineering"
// 9 stages across four beats:
//   1-2  framing: the question + the old paradigm
//   3    the shift to context engineering  [takeaway 1]
//   4-5  the memory file + its outbound links
//   6    the linked docs appear            [takeaway 2]
//   7    the agent reads a linked doc
//   8    shared truth: human and agent read the same files [takeaway 3]
//   9    closing emphasis
class ContextEngineeringStage implements StageController {
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

export const ctxEngStage = new ContextEngineeringStage();
