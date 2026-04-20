import type { PresentationConfig } from '$lib/types';

const SKILLS = 'skills';
const SEGMENT = 'agentic-chat';

export const presentationConfig: PresentationConfig = {
  name: 'AI for Interactive Media',
  description: 'Session 6 presentation deck - canvas-based spatial walkthrough.',
  steps: [
    // --- Segment 1: Skills landscape ---
    {
      id: 'land-skills',
      type: 'camera',
      segmentId: SKILLS,
      duration: 0.01,
      label: 'Skills landscape',
    },
    { id: 'k01', type: 'advance', segmentId: SKILLS, label: 'Programming' },
    { id: 'k02', type: 'advance', segmentId: SKILLS, label: 'UI & frontend' },
    { id: 'k03', type: 'advance', segmentId: SKILLS, label: 'Visual design' },
    { id: 'k04', type: 'advance', segmentId: SKILLS, label: 'Interaction design' },
    { id: 'k05', type: 'advance', segmentId: SKILLS, label: 'Writing & narrative' },
    { id: 'k06', type: 'advance', segmentId: SKILLS, label: 'Audio & music' },
    { id: 'k07', type: 'advance', segmentId: SKILLS, label: 'Animation & motion' },
    { id: 'k08', type: 'advance', segmentId: SKILLS, label: 'Prototyping & QA' },

    // --- Transition to Segment 2: Agentic chat ---
    {
      id: 'to-chat',
      type: 'camera',
      segmentId: SEGMENT,
      duration: 1.4,
      label: 'From chatbot to agent',
    },

    // Part 1 - chatbot baseline (4 advances)
    { id: 'a01', type: 'advance', segmentId: SEGMENT, label: 'User: casual hello' },
    { id: 'a02', type: 'advance', segmentId: SEGMENT, label: 'AI: reply' },
    { id: 'a03', type: 'advance', segmentId: SEGMENT, label: 'User: banana question' },
    { id: 'a04', type: 'advance', segmentId: SEGMENT, label: 'AI: intuition (wrong)' },

    // Part 2 - agentic mode (9 advances)
    { id: 'a05', type: 'advance', segmentId: SEGMENT, label: 'Revise - work it out' },
    { id: 'a06', type: 'advance', segmentId: SEGMENT, label: 'Thinking opens' },
    { id: 'a07', type: 'advance', segmentId: SEGMENT, label: 'Thinking: case-insensitive' },
    { id: 'a08', type: 'advance', segmentId: SEGMENT, label: 'Python: first attempt' },
    { id: 'a09', type: 'advance', segmentId: SEGMENT, label: 'Python: NameError' },
    { id: 'a10', type: 'advance', segmentId: SEGMENT, label: 'Python: fixed code' },
    { id: 'a11', type: 'advance', segmentId: SEGMENT, label: 'Python: validation asserts' },
    { id: 'a12', type: 'advance', segmentId: SEGMENT, label: 'Result: 3' },
    { id: 'a13', type: 'advance', segmentId: SEGMENT, label: 'AI: corrected answer' },

    // Part 3 - narration: scroll + highlight the two python tool-use cards
    {
      id: 'z15',
      type: 'spotlight',
      segmentId: SEGMENT,
      targetId: 'python-run',
      duration: 0.9,
      label: 'Spotlight: python tool-call (error)',
    },
    {
      id: 'z16',
      type: 'spotlight',
      segmentId: SEGMENT,
      targetId: 'python-validation',
      duration: 0.9,
      label: 'Spotlight: validation asserts',
    },

    // Part 4 - live-data demo; spotlights instead of zoom-ins for consistency
    { id: 'a16', type: 'advance', segmentId: SEGMENT, label: 'User: 2026 shipments?' },
    { id: 'a17', type: 'advance', segmentId: SEGMENT, label: 'AI: stale pre-cutoff answer' },
    { id: 'a18', type: 'advance', segmentId: SEGMENT, label: 'Thinking: needs web' },
    { id: 'a19', type: 'advance', segmentId: SEGMENT, label: 'Web search results' },
    {
      id: 'z18',
      type: 'spotlight',
      segmentId: SEGMENT,
      targetId: 'search-results',
      duration: 0.9,
      label: 'Spotlight: search queries + results',
    },
    { id: 'a20', type: 'advance', segmentId: SEGMENT, label: 'Source excerpt' },
    {
      id: 'z19',
      type: 'spotlight',
      segmentId: SEGMENT,
      targetId: 'source-excerpt',
      duration: 0.9,
      label: 'Spotlight: source excerpt',
    },
    { id: 'a21', type: 'advance', segmentId: SEGMENT, label: 'AI: cited answer' },

    // Return to overview of the segment
    {
      id: 'z20',
      type: 'camera',
      segmentId: SEGMENT,
      duration: 1.4,
      label: 'Back to overview',
    },
  ],
};
