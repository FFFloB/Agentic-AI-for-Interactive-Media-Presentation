import type { StageController } from '$lib/types';

// "Tokens: how much fits" - closing segment.
// Stages run linearly through: framing question, explainer, tokenization
// demo, transition, the five scale bars, and a closing beat.
export const TOK = {
  // Part 1 - framing + explanation
  ASK: 1,
  EXPLAIN: 2,
  TOKENIZE_DEMO: 3,

  // Part 2 - the scale bars (cumulative inside one chart card)
  TRANSITION: 4,
  TIER_1: 5,
  TIER_2: 6,
  TIER_3: 7,
  TIER_4: 8,
  TIER_5: 9,

  // Part 3 - closing beat
  CLOSER: 10,
} as const;

class TokensStage implements StageController {
  stageIndex = $state(0);
  readonly maxStage = TOK.CLOSER;

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

export const tokensStage = new TokensStage();
