import type { PresentationConfig } from '$lib/types';

const SKILLS = 'skills';
const CHAT = 'agentic-chat';

export const presentationConfig: PresentationConfig = {
  name: 'AI for Interactive Media',
  description: 'Session 6 presentation deck - per-segment scripts with cross-segment navigation.',
  scripts: [
    // ==============================
    // Segment 1: Skills landscape
    // Up/Down to reveal bullets; Right to move to the next segment.
    // ==============================
    {
      segmentId: SKILLS,
      steps: [
        { id: 'k01', type: 'advance', segmentId: SKILLS, label: 'Programming' },
        { id: 'k02', type: 'advance', segmentId: SKILLS, label: 'UI & frontend' },
        { id: 'k03', type: 'advance', segmentId: SKILLS, label: 'Visual design' },
        { id: 'k04', type: 'advance', segmentId: SKILLS, label: 'Interaction design' },
        { id: 'k05', type: 'advance', segmentId: SKILLS, label: 'Writing & narrative' },
        { id: 'k06', type: 'advance', segmentId: SKILLS, label: 'Audio & music' },
        { id: 'k07', type: 'advance', segmentId: SKILLS, label: 'Animation & motion' },
        { id: 'k08', type: 'advance', segmentId: SKILLS, label: 'Prototyping & QA' },
      ],
    },

    // ==============================
    // Segment 2: Agentic chat
    // ==============================
    {
      segmentId: CHAT,
      steps: [
        // Part 1 - chatbot baseline
        { id: 'a01', type: 'advance', segmentId: CHAT, label: 'User: casual hello' },
        { id: 'a02', type: 'advance', segmentId: CHAT, label: 'AI: reply' },
        { id: 'a03', type: 'advance', segmentId: CHAT, label: 'User: banana question' },
        { id: 'a04', type: 'advance', segmentId: CHAT, label: 'AI: intuition (wrong)' },

        // Part 2 - agentic mode
        { id: 'a05', type: 'advance', segmentId: CHAT, label: 'Revise - work it out' },
        { id: 'a06', type: 'advance', segmentId: CHAT, label: 'Thinking opens' },
        { id: 'a07', type: 'advance', segmentId: CHAT, label: 'Thinking: case-insensitive' },
        { id: 'a08', type: 'advance', segmentId: CHAT, label: 'Python: first attempt' },
        { id: 'a09', type: 'advance', segmentId: CHAT, label: 'Python: NameError' },
        { id: 'a10', type: 'advance', segmentId: CHAT, label: 'Python: fixed code' },
        { id: 'a11', type: 'advance', segmentId: CHAT, label: 'Python: validation asserts' },
        { id: 'a12', type: 'advance', segmentId: CHAT, label: 'Result: 3' },
        { id: 'a13', type: 'advance', segmentId: CHAT, label: 'AI: corrected answer' },

        // Part 3 - narration: scroll + highlight the two python tool-use cards
        {
          id: 'z15',
          type: 'spotlight',
          segmentId: CHAT,
          targetId: 'python-run',
          duration: 0.9,
          label: 'Spotlight: python tool-call (error)',
        },
        {
          id: 'z16',
          type: 'spotlight',
          segmentId: CHAT,
          targetId: 'python-validation',
          duration: 0.9,
          label: 'Spotlight: validation asserts',
        },

        // Part 4 - live-data demo
        { id: 'a16', type: 'advance', segmentId: CHAT, label: 'User: 2026 shipments?' },
        { id: 'a17', type: 'advance', segmentId: CHAT, label: 'AI: stale pre-cutoff answer' },
        { id: 'a18', type: 'advance', segmentId: CHAT, label: 'Thinking: needs web' },
        { id: 'a19', type: 'advance', segmentId: CHAT, label: 'Web search results' },
        {
          id: 'z18',
          type: 'spotlight',
          segmentId: CHAT,
          targetId: 'search-results',
          duration: 0.9,
          label: 'Spotlight: search results',
        },
        { id: 'a20', type: 'advance', segmentId: CHAT, label: 'Source excerpt' },
        {
          id: 'z19',
          type: 'spotlight',
          segmentId: CHAT,
          targetId: 'source-excerpt',
          duration: 0.9,
          label: 'Spotlight: source excerpt',
        },
        { id: 'a21', type: 'advance', segmentId: CHAT, label: 'AI: cited answer' },
      ],
    },
  ],
};
