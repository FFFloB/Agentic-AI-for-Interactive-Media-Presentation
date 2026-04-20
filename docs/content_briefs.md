# Content Briefs

Per-segment design briefs. These describe content intent and staging, not implementation.

## Agentic Chat Segment

**Purpose**: Illustrate the transition from chatbot-style LLMs to agentic systems.

**Visual language**: Matches modern agentic UIs (Claude.ai, ChatGPT with tools, Cursor). Rounded message bubbles, collapsible "thinking" sections, tool-use cards, inline code blocks with syntax highlighting.

**Not truly interactive**: pre-staged. The "send" affordance on the chat input is a visible trigger, but advancing the script (click or space) is what drives each stage.

### Pre-staged advance points

*Part 1 - chatbot limitation*
1. User message: a simple casual exchange.
2. AI replies correctly (baseline).
3. User asks: "how many 'A's are in the word banana?"
4. AI answers wrong (intuition-based chatbot response).

*Part 2 - agentic mode*
5. Wrong answer is visibly reversed / struck through.
6. A "thinking" section opens, making the internal dialog visible.
7. AI breaks down the prompt, concludes it is a string/math problem, decides to write code.
8. Initial code block appears inline (code-style embed).
9. Code runs in sandbox, throws an error.
10. AI identifies and corrects the error.
11. Corrected code tests against known strings (validation).
12. Validation passes; "banana" is fed in; correct count returned.
13. Final corrected answer is emitted as the official reply.

*Part 3 - narration zoom*
14. Free vertical scroll unlocks; presenter scrolls through the dialog.
15. Tool-use blocks (Python execution) are visually highlighted as zoom targets; narration point about tools as capabilities.

*Part 4 - learned knowledge vs. live search*
16. User asks: "How many bananas have been shipped world-wide in 2026?"
17. AI answers wrong (pre-cutoff training data).
18. Agent is granted web-search tools; thinking section reopens.
19. A series of Google searches are shown.
20. Specific websites and relevant excerpts appear inline.
21. AI weighs sources and compiles an updated, cited answer.

### Zoom targets (authored)

- Tool-use card for Python execution (Part 2).
- A code block in its error state (Part 2).
- A source excerpt card (Part 4).
- The full "thinking" section at a readable scale.

### Scroll behavior

- Auto-scroll to bottom during staging.
- Free vertical scroll unlocks after step 13 (and again after step 21).

## Sessions Flow Segment

**Purpose**: Later in the talk, a reflective meta-moment visualizing the collaboration flow of all sessions that produced this presentation - human vs AI contribution over time.

**Data source**: Pre-staged snapshot, baked at authoring time from `session_audits/*.jsonl`, `docs/session_log.md`, and git history (the `Co-Authored-By: Claude` trailer distinguishes AI-assisted commits per `CLAUDE.md`). **Not live.** A build-time script extracts the data into a static config consumed by the segment.

**Visual language**: Vertical timeline axis, oldest session at top and newest at bottom (reading downward toward the talk itself as culmination). Stacked bars encode human vs AI contribution across two complementary magnitudes: dialog interactions (turns between human and AI extracted from the audit files) and code churn (files touched with added/removed line counts, extracted via `git log --numstat`). The same bar convention is used consistently at every drill level, so the viewer reads the same encoding throughout. Dark background, same typography as the rest of the deck.

**Bar magnitude (two complementary views)**:
- **Interactions**: one unit per turn in the session's audit file. Each unit colored by speaker (human green, AI gradient).
- **Code churn**: lines added/removed per file in commits that fall in the session's time window. Each unit colored by author (human green for human-only commits, AI gradient for commits carrying the `Co-Authored-By: Claude` trailer).
- At Level 1, the primary timeline bar shows interactions; a thinner companion bar alongside it shows code churn, so both stories are visible at a glance.
- At Levels 2 and 3, both encodings are preserved on each sub-bar.

### Three drill levels (per-node click zooms in)

*Level 1 - Full timeline*
- Vertical axis of all sessions, chronological.
- Each session rendered as a horizontal stacked bar anchored to its date. Bar magnitude (width or length) encodes session size (commits, interactions, or lines - to pin at authoring time); the fill shows human vs AI proportion.
- Session title/label sits next to each bar.

*Level 2 - Single session detail*
- Zoom target: an individual session node.
- Layout: session header (title, date, summary from `session_log.md`); below, the session's contributions rendered as their own stacked mini-bars - one per doc touched, per decision made, and per commit. Same stacked-bar convention.
- Each contribution row is itself a zoom target for Level 3.

*Level 3 - Individual contribution*
- Zoom target: a specific contribution (commit, doc change, or decision).
- Layout: full detail - commit message + diff preview, or the decision text, or the doc edit - with a supporting snippet from the underlying audit interaction when relevant. Author attribution clearly marked with the same color key.

### Stacked-bar color convention

- **Human contribution**: green highlight.
- **AI contribution**: vibrant gradient accent (matching the headline gradient family).
- **Co-authored / shared**: blended stripe of the two.

### Zoom targets (authored)

- Each session node at Level 1.
- Each contribution row within a session at Level 2.
- Zoom-out is driven by the presentation script (same advance control).
- The presenter may also author a few "highlight" zoom-ins as part of the script (e.g. the first session, an especially AI-heavy session, the session where a key decision landed) so that the scripted walkthrough hits meaningful examples before handing off to free exploration.

### Scroll behavior

- No staged reveal: the segment is a data overview, shown in full on entry.
- Free vertical scroll is available from the moment the segment is entered if the timeline overflows the viewport.
- At deeper levels, scroll only if content overflows.

### Data extraction (authoring-time)

- Reads `session_audits/*.jsonl` for session timestamps and per-turn dialog data (one unit per turn, speaker-tagged).
- Reads `docs/session_log.md` for session titles, summaries, and human-authored contribution items.
- Reads `git log --numstat` for per-commit, per-file added/removed line counts. The `Co-Authored-By: Claude` trailer distinguishes AI-assisted commits from human-only ones.
- Correlates commits to sessions by timestamp windowing (each commit falls into the session active at its authorship time).
- Output: a static `sessions_snapshot` data file consumed by the segment component.
