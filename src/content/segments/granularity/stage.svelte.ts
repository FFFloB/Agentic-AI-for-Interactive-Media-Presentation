import type { StageController } from '$lib/types';

// Granularity / time-dimension segment.
// Stages:
//   1  framing question
//   2  intro callout ("spectrum, not a switch")
//   3  micro tier card (seconds)
//   4  medium tier card (minutes)
//   5  macro tier card (hours)
//   6  "you mix and match" emphasis
//   7  closing beat
class GranularityStage implements StageController {
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

export const granularityStage = new GranularityStage();
