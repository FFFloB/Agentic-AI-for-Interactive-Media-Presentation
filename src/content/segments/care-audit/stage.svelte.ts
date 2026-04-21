import type { StageController } from '$lib/types';

// "The audit, live" - interactive timeline viewer.
// No stage progression: the segment is entered and the presenter drives
// the demo with their mouse (zoom, pan, click, scroll the detail panel).
class CareAuditStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = 0;

  advance(): boolean {
    return false;
  }
  retreat(): boolean {
    return false;
  }
  reset() {
    this.stageIndex = 0;
  }
}

export const careAuditStage = new CareAuditStage();
