import type { StageController } from '$lib/types';

// Title slide has no internal progression - it is a single visual state
// revealed progressively via CSS animation on segment entry. Keeping the
// StageController interface so it plugs into the registry like every other
// segment, even though there's nothing to advance.
class TitleStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = 0;

  advance(): boolean {
    return false;
  }
  retreat(): boolean {
    return false;
  }
  reset(): void {
    this.stageIndex = 0;
  }
}

export const titleStage = new TitleStage();
