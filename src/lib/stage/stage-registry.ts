import type { StageController } from '$lib/types';

const controllers = new Map<string, StageController>();

export function registerStage(segmentId: string, controller: StageController) {
  controllers.set(segmentId, controller);
}

export function unregisterStage(segmentId: string) {
  controllers.delete(segmentId);
}

export function getStage(segmentId: string): StageController | undefined {
  return controllers.get(segmentId);
}

export function resetAllStages() {
  for (const ctrl of controllers.values()) {
    ctrl.reset();
  }
}
