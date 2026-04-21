import type { StageController } from '$lib/types';

// Stages for the "From Prompt to Context" segment.
//
// The narrative is intentionally linear so advance()/retreat() drive the
// whole sequence from the presentation script. Phase boundaries are kept
// as named constants for readability and so the component can ask
// questions like "are we in the fill-up phase yet?" without memorising
// numbers.
export const CTX = {
  // Phase 1 - dialog builds from individual bubbles
  BUBBLE_USER_1: 1,
  BUBBLE_AI_1: 2,
  FILE_CHANGE_1: 3,
  BUBBLE_USER_2: 4,
  BUBBLE_AI_2: 5,
  FILE_CHANGE_2: 6,

  // Phase 2 - bubbles morph into a single Dialog block
  MORPH_TO_DIALOG: 7,

  // Phase 3 - stacking chart elements reveal, one by one
  STACK_SYSTEM: 8,
  STACK_TOOLS: 9,
  STACK_MEMORY: 10,
  STACK_SUMMBUF: 11,
  STACK_FREE: 12,

  // Phase 4 - walk through each element with a sample
  WALK_SYSTEM: 13,
  WALK_TOOLS: 14,
  WALK_MEMORY: 15,
  WALK_DIALOG: 16,
  WALK_SUMMBUF: 17,
  WALK_FREE: 18,

  // Phase 5 - dialog grows, free space shrinks
  FILL_1: 19,
  FILL_2: 20,
  FILL_3: 21,

  // Phase 6 - compression, fresh session with summary
  COMPRESS: 22,
  FRESH_SESSION: 23,

  // Phase 7 - session reset
  RESET: 24,

  // Phase 8 - final takeaways, revealed one at a time in the scroll.
  TAKEAWAY_1: 25,
  TAKEAWAY_2: 26,
  TAKEAWAY_3: 27,
  TAKEAWAY_4: 28,
} as const;

class ContextStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = CTX.TAKEAWAY_4;

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

  // True when the index is exactly at this stage (useful for walk-through
  // samples that must collapse once the walk-through moves on).
  exactly(stage: number): boolean {
    return this.stageIndex === stage;
  }

  // True when we are currently in the walk-through phase for a given block.
  // Each block only owns one stage, so this just aliases exactly() but
  // reads nicer at the call site.
  walkingThrough(stage: number): boolean {
    return this.stageIndex === stage;
  }
}

export const contextStage = new ContextStage();
