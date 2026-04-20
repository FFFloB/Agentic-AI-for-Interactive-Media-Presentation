import type { SegmentConfig } from '$lib/types';

export const segmentConfigs: SegmentConfig[] = [
  {
    id: 'skills',
    width: 1920,
    height: 1080,
    component: 'SkillsSegment',
    label: 'A broad skills landscape',
  },
  {
    id: 'agentic-chat',
    width: 1920,
    height: 6200,
    component: 'AgenticChatSegment',
    label: 'From chatbot to agent',
    // Static fallbacks; the segment registers precise runtime rects.
    zoomTargets: [
      { id: 'thinking-one', xOffset: 550, yOffset: 900, width: 820, height: 260 },
      { id: 'python-run', xOffset: 550, yOffset: 1200, width: 820, height: 360 },
      { id: 'python-fix', xOffset: 550, yOffset: 1600, width: 820, height: 360 },
      { id: 'python-validation', xOffset: 550, yOffset: 2000, width: 820, height: 360 },
      { id: 'thinking-two', xOffset: 550, yOffset: 3200, width: 820, height: 220 },
      { id: 'search-results', xOffset: 550, yOffset: 3500, width: 820, height: 560 },
      { id: 'source-excerpt', xOffset: 550, yOffset: 4050, width: 820, height: 220 },
    ],
  },
];
