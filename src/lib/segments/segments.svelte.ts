import type { PlacedSegment, SegmentConfig } from '$lib/types';
import { DEFAULTS } from '$lib/constants';

class SegmentsStore {
  placed = $state<PlacedSegment[]>([]);

  load(list: SegmentConfig[]) {
    let x = 0;
    const placed: PlacedSegment[] = [];
    for (const s of list) {
      placed.push({ ...s, xOffset: x });
      x += s.width + DEFAULTS.segment.gap;
    }
    this.placed = placed;
  }

  get(id: string): PlacedSegment | undefined {
    return this.placed.find((s) => s.id === id);
  }
}

export const segments = new SegmentsStore();
