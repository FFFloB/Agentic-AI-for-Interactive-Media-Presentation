import type { StageController } from '$lib/types';

// "Useful resources" - appendix segment. Policy + three tools + repo.
// Four stages: framing -> York policy -> three-tool grid -> public repo.
class ResourcesStage implements StageController {
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

export const resourcesStage = new ResourcesStage();
