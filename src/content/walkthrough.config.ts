import type { PresentationConfig } from '$lib/types';

const TITLE = 'title';
const SKILLS = 'skills';
const LLM = 'llm-prediction';
const CHAT = 'agentic-chat';
const CONTEXT = 'context';
const TOKENS = 'tokens';
const CTX_ENG = 'context-engineering';
const GRAN = 'granularity';
const UD = 'uses-design';
const UT = 'uses-technical';
const CARE = 'care-overview';
const CARE_TRAIN = 'care-training';
const CARE_OWN = 'care-ownership';
const CARE_ATTR = 'care-attribution';
const CARE_AUDIT = 'care-audit';
const CARE_NUMS = 'care-numbers';
const CARE_FOOT = 'care-footprint';
const CARE_CTX = 'care-context';
const CARE_WRONG = 'care-wrong';
const CARE_AGREE = 'care-agreement';

export const presentationConfig: PresentationConfig = {
  name: 'AI for Interactive Media',
  description: 'Session 6 presentation deck - per-segment scripts with cross-segment navigation.',
  scripts: [
    // ==============================
    // Segment 0: Title slide
    // No internal progression - just the opening visual.
    // ==============================
    {
      segmentId: TITLE,
      steps: [],
    },

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
    // Segment 2: What is an LLM?
    // Next-word prediction demo + context view in a dialog.
    // ==============================
    {
      segmentId: LLM,
      steps: [
        { id: 'l01', type: 'advance', segmentId: LLM, label: 'User: finish this sentence' },
        { id: 'l02', type: 'advance', segmentId: LLM, label: 'Prediction candidates' },
        { id: 'l03', type: 'advance', segmentId: LLM, label: 'Chosen: mat - completion' },
        { id: 'l04', type: 'advance', segmentId: LLM, label: 'Trace: feed-back loop' },
        { id: 'l05', type: 'advance', segmentId: LLM, label: 'Transition: in a conversation' },
        { id: 'l06', type: 'advance', segmentId: LLM, label: 'User: warning colour?' },
        { id: 'l07', type: 'advance', segmentId: LLM, label: 'AI: red reply' },
        { id: 'l08', type: 'advance', segmentId: LLM, label: 'User: follow-up (cautionary)' },
        { id: 'l09', type: 'advance', segmentId: LLM, label: 'Context view: reads own reply' },
        { id: 'l10', type: 'advance', segmentId: LLM, label: 'AI: next reply' },
      ],
    },

    // ==============================
    // Segment 3: Agentic chat
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

        // Part 5 - local files: read + edit
        { id: 'a22', type: 'advance', segmentId: CHAT, label: 'User: edit local draft' },
        { id: 'a23', type: 'advance', segmentId: CHAT, label: 'Thinking: read then append' },
        { id: 'a24', type: 'advance', segmentId: CHAT, label: 'read_file: draft contents' },
        { id: 'a25', type: 'advance', segmentId: CHAT, label: 'edit_file: append 2026 section' },
        { id: 'a26', type: 'advance', segmentId: CHAT, label: 'AI: confirms edit' },
      ],
    },

    // ==============================
    // Segment 3: From prompt to context
    // Builds the context-window mental model.
    // ==============================
    {
      segmentId: CONTEXT,
      steps: [
        // Phase 1 - bubbles of a conversation appear one by one
        { id: 'c01', type: 'advance', segmentId: CONTEXT, label: 'Prompt 1' },
        { id: 'c02', type: 'advance', segmentId: CONTEXT, label: 'Thinking 1' },
        { id: 'c03', type: 'advance', segmentId: CONTEXT, label: 'File change 1' },
        { id: 'c04', type: 'advance', segmentId: CONTEXT, label: 'Prompt 2' },
        { id: 'c05', type: 'advance', segmentId: CONTEXT, label: 'Thinking 2' },
        { id: 'c06', type: 'advance', segmentId: CONTEXT, label: 'File change 2' },

        // Phase 2 - bubbles merge into the Dialog block
        { id: 'c07', type: 'advance', segmentId: CONTEXT, label: 'Morph to Dialog' },

        // Phase 3 - stacking chart elements appear
        { id: 'c08', type: 'advance', segmentId: CONTEXT, label: 'Add: System prompt' },
        { id: 'c09', type: 'advance', segmentId: CONTEXT, label: 'Add: Tools' },
        { id: 'c10', type: 'advance', segmentId: CONTEXT, label: 'Add: Memory' },
        { id: 'c11', type: 'advance', segmentId: CONTEXT, label: 'Add: Summarisation buffer' },
        { id: 'c12', type: 'advance', segmentId: CONTEXT, label: 'Add: Free space' },

        // Phase 4 - walk through each block with a sample
        { id: 'c13', type: 'advance', segmentId: CONTEXT, label: 'Walk: System prompt' },
        { id: 'c14', type: 'advance', segmentId: CONTEXT, label: 'Walk: Tools' },
        { id: 'c15', type: 'advance', segmentId: CONTEXT, label: 'Walk: Memory' },
        { id: 'c16', type: 'advance', segmentId: CONTEXT, label: 'Walk: Dialog' },
        { id: 'c17', type: 'advance', segmentId: CONTEXT, label: 'Walk: Summarisation buffer' },
        { id: 'c18', type: 'advance', segmentId: CONTEXT, label: 'Walk: Free space' },

        // Phase 5 - fill-up
        { id: 'c19', type: 'advance', segmentId: CONTEXT, label: 'Fill 1' },
        { id: 'c20', type: 'advance', segmentId: CONTEXT, label: 'Fill 2' },
        { id: 'c21', type: 'advance', segmentId: CONTEXT, label: 'Fill 3 (nearly full)' },

        // Phase 6 - compression -> fresh session
        { id: 'c22', type: 'advance', segmentId: CONTEXT, label: 'Compression' },
        { id: 'c23', type: 'advance', segmentId: CONTEXT, label: 'Fresh session' },

        // Phase 7 - session reset
        { id: 'c24', type: 'advance', segmentId: CONTEXT, label: 'Session reset' },

        // Phase 8 - closing takeaways, one per step so they land in the scroll
        // like every other entry.
        { id: 'c25', type: 'advance', segmentId: CONTEXT, label: 'Takeaway 1' },
        { id: 'c26', type: 'advance', segmentId: CONTEXT, label: 'Takeaway 2' },
        { id: 'c27', type: 'advance', segmentId: CONTEXT, label: 'Takeaway 3' },
        { id: 'c28', type: 'advance', segmentId: CONTEXT, label: 'Takeaway 4' },
      ],
    },

    // ==============================
    // Segment 6: From prompt engineering to context engineering
    // Closing segment on memory, linked docs, and shared truth.
    // ==============================
    {
      segmentId: CTX_ENG,
      steps: [
        { id: 'e01', type: 'advance', segmentId: CTX_ENG, label: 'User: framing question' },
        { id: 'e02', type: 'advance', segmentId: CTX_ENG, label: 'Old: prompt engineering' },
        { id: 'e03', type: 'advance', segmentId: CTX_ENG, label: 'New: context engineering' },
        { id: 'e04', type: 'advance', segmentId: CTX_ENG, label: 'memory.md content' },
        { id: 'e05', type: 'advance', segmentId: CTX_ENG, label: 'Callout: links point to other files' },
        { id: 'e06', type: 'advance', segmentId: CTX_ENG, label: 'Linked docs appear' },
        { id: 'e07', type: 'advance', segmentId: CTX_ENG, label: 'Agent reads linked doc' },
        { id: 'e08', type: 'advance', segmentId: CTX_ENG, label: 'Shared truth diagram' },
        { id: 'e09', type: 'advance', segmentId: CTX_ENG, label: 'Transparency + traceability' },
      ],
    },

    // ==============================
    // Segment 7: Tokens, and how much fits (closing segment on scale)
    // ==============================
    {
      segmentId: TOKENS,
      steps: [
        { id: 't01', type: 'advance', segmentId: TOKENS, label: 'User: what is a token?' },
        { id: 't02', type: 'advance', segmentId: TOKENS, label: 'Explainer: the unit' },
        { id: 't03', type: 'advance', segmentId: TOKENS, label: 'Tokenizer demo' },
        { id: 't04', type: 'advance', segmentId: TOKENS, label: 'Transition: how much fits?' },
        { id: 't05', type: 'advance', segmentId: TOKENS, label: 'Tier 1 - 4K' },
        { id: 't06', type: 'advance', segmentId: TOKENS, label: 'Tier 2 - 32K' },
        { id: 't07', type: 'advance', segmentId: TOKENS, label: 'Tier 3 - 128K' },
        { id: 't08', type: 'advance', segmentId: TOKENS, label: 'Tier 4 - 200K' },
        { id: 't09', type: 'advance', segmentId: TOKENS, label: 'Tier 5 - 1M+ (frontier)' },
        { id: 't10', type: 'advance', segmentId: TOKENS, label: 'Closing: what this changes' },
      ],
    },

    // ==============================
    // Segment 8: Granularity / time-scale of AI task delegation
    // ==============================
    {
      segmentId: GRAN,
      steps: [
        { id: 'g01', type: 'advance', segmentId: GRAN, label: 'User: where does AI fit?' },
        { id: 'g02', type: 'advance', segmentId: GRAN, label: 'Intro: not all-or-nothing' },
        { id: 'g03', type: 'advance', segmentId: GRAN, label: 'Micro - seconds' },
        { id: 'g04', type: 'advance', segmentId: GRAN, label: 'Medium - minutes' },
        { id: 'g05', type: 'advance', segmentId: GRAN, label: 'Macro - hours' },
        { id: 'g06', type: 'advance', segmentId: GRAN, label: 'You control the mix' },
        { id: 'g07', type: 'advance', segmentId: GRAN, label: 'Closer: where this leaves us' },
      ],
    },

    // ==============================
    // Segment 9: Use cases - Design
    // ==============================
    {
      segmentId: UD,
      steps: [
        { id: 'd01', type: 'advance', segmentId: UD, label: 'User: designer framing' },
        { id: 'd02', type: 'advance', segmentId: UD, label: 'Use: full prototype' },
        { id: 'd03', type: 'advance', segmentId: UD, label: 'Use: Figma to testable' },
        { id: 'd04', type: 'advance', segmentId: UD, label: 'Use: UX QA' },
        { id: 'd05', type: 'advance', segmentId: UD, label: 'Use: ship the app (dare)' },
        { id: 'd06', type: 'advance', segmentId: UD, label: 'Closer: boundary collapsed' },
        { id: 'd07', type: 'advance', segmentId: UD, label: 'Gentle warning' },
      ],
    },

    // ==============================
    // Segment 10: Use cases - Technical / Engineering
    // ==============================
    {
      segmentId: UT,
      steps: [
        { id: 'u01', type: 'advance', segmentId: UT, label: 'User: developer framing' },
        { id: 'u02', type: 'advance', segmentId: UT, label: 'Use: UX work' },
        { id: 'u03', type: 'advance', segmentId: UT, label: 'Use: code review' },
        { id: 'u04', type: 'advance', segmentId: UT, label: 'Use: documentation' },
        { id: 'u05', type: 'advance', segmentId: UT, label: 'Use: module delegation' },
        { id: 'u06', type: 'advance', segmentId: UT, label: 'Use: test, build, deploy' },
        { id: 'u07', type: 'advance', segmentId: UT, label: 'Use: backend + data' },
        { id: 'u08', type: 'advance', segmentId: UT, label: 'Use: security audits' },
        { id: 'u09', type: 'advance', segmentId: UT, label: 'Closer: where judgement stays' },
        { id: 'u10', type: 'advance', segmentId: UT, label: 'Gentle warning' },
      ],
    },

    // ==============================
    // Segment 11: Where care is required (overview of the closing cluster)
    // ==============================
    {
      segmentId: CARE,
      steps: [
        { id: 'w01', type: 'advance', segmentId: CARE, label: 'Legal + ownership group' },
        { id: 'w02', type: 'advance', segmentId: CARE, label: 'Ethical practice group' },
        { id: 'w03', type: 'advance', segmentId: CARE, label: 'Mechanical limits group' },
        { id: 'w04', type: 'advance', segmentId: CARE, label: 'Closer' },
      ],
    },

    // ==============================
    // Segment 12: What went in (training data, indemnity, Getty)
    // ==============================
    {
      segmentId: CARE_TRAIN,
      steps: [
        { id: 'tr01', type: 'advance', segmentId: CARE_TRAIN, label: 'User: where did it come from?' },
        { id: 'tr02', type: 'advance', segmentId: CARE_TRAIN, label: 'Training reality' },
        { id: 'tr03', type: 'advance', segmentId: CARE_TRAIN, label: 's.29A CDPA source card' },
        { id: 'tr04', type: 'advance', segmentId: CARE_TRAIN, label: 'Getty v Stability AI' },
        { id: 'tr05', type: 'advance', segmentId: CARE_TRAIN, label: 'Using vs training' },
        { id: 'tr06', type: 'advance', segmentId: CARE_TRAIN, label: 'Indemnity table' },
        { id: 'tr07', type: 'advance', segmentId: CARE_TRAIN, label: 'Adobe Firefly note' },
        { id: 'tr08', type: 'advance', segmentId: CARE_TRAIN, label: 'Closer: rules of thumb' },
      ],
    },

    // ==============================
    // Segment 13: Who owns this? (copyrightability + authorship)
    // ==============================
    {
      segmentId: CARE_OWN,
      steps: [
        { id: 'ow01', type: 'advance', segmentId: CARE_OWN, label: 'User: is it mine?' },
        { id: 'ow02', type: 'advance', segmentId: CARE_OWN, label: 'Three scenarios' },
        { id: 'ow03', type: 'advance', segmentId: CARE_OWN, label: 'The test: Infopaq / THJ v Sheridan' },
        { id: 'ow04', type: 'advance', segmentId: CARE_OWN, label: 's.9(3) repeal proposed' },
        { id: 'ow05', type: 'advance', segmentId: CARE_OWN, label: 'Decision rubric' },
        { id: 'ow06', type: 'advance', segmentId: CARE_OWN, label: 'Closer: the principle' },
      ],
    },

    // ==============================
    // Segment 14: Name your collaborators (attribution + transparency)
    // ==============================
    {
      segmentId: CARE_ATTR,
      steps: [
        { id: 'at01', type: 'advance', segmentId: CARE_ATTR, label: 'User: do I have to say?' },
        { id: 'at02', type: 'advance', segmentId: CARE_ATTR, label: 'The short answer' },
        { id: 'at03', type: 'advance', segmentId: CARE_ATTR, label: 'York policy + Gemini' },
        { id: 'at04', type: 'advance', segmentId: CARE_ATTR, label: 'D&AD 2026 disclosure' },
        { id: 'at05', type: 'advance', segmentId: CARE_ATTR, label: 'Named-collaborator frame' },
        { id: 'at06', type: 'advance', segmentId: CARE_ATTR, label: 'IPA/ISBA Principle 11' },
        { id: 'at07', type: 'advance', segmentId: CARE_ATTR, label: 'Live audit-log demo' },
        { id: 'at08', type: 'advance', segmentId: CARE_ATTR, label: 'Closer' },
      ],
    },

    // ==============================
    // Segment 15: The audit, live - interactive timeline viewer.
    // No internal progression; the presenter drives the demo with mouse.
    // ==============================
    {
      segmentId: CARE_AUDIT,
      steps: [],
    },

    // ==============================
    // Segment 16: The audit, quantified (hero stats + leverage ratio + env hero)
    // ==============================
    {
      segmentId: CARE_NUMS,
      steps: [
        { id: 'cn01', type: 'advance', segmentId: CARE_NUMS, label: 'User: how much did I write?' },
        { id: 'cn02', type: 'advance', segmentId: CARE_NUMS, label: 'Hero: span + work hours' },
        { id: 'cn03', type: 'advance', segmentId: CARE_NUMS, label: 'Hero: prompts vs replies/thinks/tools' },
        { id: 'cn04', type: 'advance', segmentId: CARE_NUMS, label: 'The leverage ratio reveal' },
        { id: 'cn05', type: 'advance', segmentId: CARE_NUMS, label: 'Tool breakdown' },
        { id: 'cn06', type: 'advance', segmentId: CARE_NUMS, label: 'Git + codebase' },
        { id: 'cn07', type: 'advance', segmentId: CARE_NUMS, label: 'Role shift' },
        { id: 'cn08', type: 'advance', segmentId: CARE_NUMS, label: 'Environmental hero + segue' },
      ],
    },

    // ==============================
    // Segment 17: Environmental footprint (honest breakdown + caveats)
    // ==============================
    {
      segmentId: CARE_FOOT,
      steps: [
        { id: 'cf01', type: 'advance', segmentId: CARE_FOOT, label: 'User: is that the whole story?' },
        { id: 'cf02', type: 'advance', segmentId: CARE_FOOT, label: 'Activity breakdown' },
        { id: 'cf03', type: 'advance', segmentId: CARE_FOOT, label: 'Comparison ladder' },
        { id: 'cf04', type: 'advance', segmentId: CARE_FOOT, label: 'Vendor vs peer-reviewed' },
        { id: 'cf05', type: 'advance', segmentId: CARE_FOOT, label: 'Training vs inference flip' },
        { id: 'cf06', type: 'advance', segmentId: CARE_FOOT, label: 'Aggregate scale-up' },
        { id: 'cf07', type: 'advance', segmentId: CARE_FOOT, label: 'Caveats' },
        { id: 'cf08', type: 'advance', segmentId: CARE_FOOT, label: 'Closer: the right question' },
      ],
    },

    // ==============================
    // Segment 18: What you put in (ethics of context engineering)
    // ==============================
    {
      segmentId: CARE_CTX,
      steps: [
        { id: 'cx01', type: 'advance', segmentId: CARE_CTX, label: 'User: what can I feed it?' },
        { id: 'cx02', type: 'advance', segmentId: CARE_CTX, label: 'Three zones' },
        { id: 'cx03', type: 'advance', segmentId: CARE_CTX, label: '"Your own" is a permission, not a blank cheque' },
        { id: 'cx04', type: 'advance', segmentId: CARE_CTX, label: 'The "never" zone is non-negotiable' },
        { id: 'cx05', type: 'advance', segmentId: CARE_CTX, label: 'Trap setup: the intuitive workaround' },
        { id: 'cx06', type: 'advance', segmentId: CARE_CTX, label: 'The trap revealed' },
        { id: 'cx07', type: 'advance', segmentId: CARE_CTX, label: 'Thesis scenario' },
        { id: 'cx08', type: 'advance', segmentId: CARE_CTX, label: 'Closer: filter at the source' },
      ],
    },

    // ==============================
    // Segment 16: Confidently wrong (mechanical limit)
    // ==============================
    {
      segmentId: CARE_WRONG,
      steps: [
        { id: 'cw01', type: 'advance', segmentId: CARE_WRONG, label: 'User: surely thinking fixes it?' },
        { id: 'cw02', type: 'advance', segmentId: CARE_WRONG, label: 'Obvious failure: layout looks fine' },
        { id: 'cw03', type: 'advance', segmentId: CARE_WRONG, label: 'Why fluency deceives' },
        { id: 'cw04', type: 'advance', segmentId: CARE_WRONG, label: 'Subtle failure: accessibility' },
        { id: 'cw05', type: 'advance', segmentId: CARE_WRONG, label: 'Mitigation rules' },
        { id: 'cw06', type: 'advance', segmentId: CARE_WRONG, label: 'Closer: the one reliable signal' },
      ],
    },

    // ==============================
    // Segment 17: The agreement trap (mechanical limit)
    // ==============================
    {
      segmentId: CARE_AGREE,
      steps: [
        { id: 'ag01', type: 'advance', segmentId: CARE_AGREE, label: 'User: why does it always agree?' },
        { id: 'ag02', type: 'advance', segmentId: CARE_AGREE, label: 'Failure in slow motion' },
        { id: 'ag03', type: 'advance', segmentId: CARE_AGREE, label: 'Why this happens' },
        { id: 'ag04', type: 'advance', segmentId: CARE_AGREE, label: 'System prompt example' },
        { id: 'ag05', type: 'advance', segmentId: CARE_AGREE, label: 'Default vs critical comparison' },
        { id: 'ag06', type: 'advance', segmentId: CARE_AGREE, label: 'Closer: agreement is cheap' },
      ],
    },
  ],
};
