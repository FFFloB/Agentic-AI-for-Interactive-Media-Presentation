# Live Demo Flow

One hour, mixed-technical audience. The assistant walks us from "what shall we build" through to a running prototype, and every artifact lands in `live_demo/sandbox/`.

## Global rules (apply to every phase)

- **Checkpoint pauses.** After each phase completes, the assistant stops and waits for the facilitator to say "continue" (or similar) before starting the next. No auto-advancing.
- **Scope policy: optimistic backlog, prioritized top-down.** The MVP checklist should be ambitious on purpose. The build phase works it top to bottom; whatever is not done when time runs out becomes honest "future work." This is more useful pedagogically than a conservative list that always finishes: it makes prioritization visible, shows the roadmap as a living document, and gives a genuine story about what the agent did and did not reach.
- **Wireframes are deliberately skipped.** The design pack plus direct implementation replaces a wireframing phase. Call this out at phase 5.
- **"Pause" is the eject word.** If the facilitator says "pause" at any point, the assistant stops immediately.
- **Audience register.** Assume a mixed room. Prefer plain language; explain jargon before using it.
- **Everything under `live_demo/sandbox/`.** No file writes outside that folder.

## Phase 1: Ideation (about 4 minutes)

**Goal.** Leave with a one-line concept the room is aligned on.

**Assistant does.** Opens with "what shall we build today?" Offers 2-3 lightweight example directions to unstick the room if ideas don't flow (e.g. a micro-tool, a small game, a one-screen utility). Asks one or two clarifying questions once ideas start landing, then proposes a candidate one-liner in the form "[thing] that [does X] for [audience] so that [outcome]." Does not start writing files yet.

**Facilitator does.** Moderates the room. Relays audience suggestions. Picks the direction to commit to.

**Checkpoint.** Facilitator confirms the one-line concept.

**Artifacts.** None yet.

## Phase 2: Spec drafting (about 6 minutes)

**Goal.** A readable brief the audience can respond to.

**Assistant does.** Creates `live_demo/sandbox/docs/brief.md` containing: concept one-liner, target user and context of use, the problem being solved, top 3-5 MVP features, explicit non-goals, and a one-line success criterion. Concise; bullet lists where possible. Shows the file path when done.

**Facilitator does.** Opens the file, reads key sections aloud or puts it on screen.

**Checkpoint.** Facilitator signals the brief is at least coherent enough to critique.

**Artifacts.** `docs/brief.md`.

## Phase 3: Spec refinement (about 3 minutes)

**Goal.** One round of audience input merged into the brief.

**Assistant does.** Asks the room "anything missing or wrong?" Listens, integrates feedback into `brief.md`, and highlights what changed.

**Facilitator does.** Collects audience input. Relays.

**Checkpoint.** Facilitator calls the brief done-enough.

**Artifacts.** Updated `docs/brief.md`.

## Phase 4: Style inquiry (about 3 minutes)

**Goal.** Clear directional input for the design pack.

**Assistant does.** Asks a short, structured set of questions. Suggested angles:
- Mood (playful / serious / calm / energetic)
- Visual rhythm (minimal / rich / dense information)
- Color temperature (warm / cool / neutral)
- Reference anchors (sites, apps, or brands the room likes)
- Motion appetite (still / subtle / lively)

Keep it conversational. Don't write anything yet.

**Facilitator does.** Sample answers from the room. Picks a direction.

**Checkpoint.** Facilitator confirms the direction.

**Artifacts.** None yet.

## Phase 5: Design pack (about 8 minutes)

**Goal.** A browsable visual sign-off kit.

**Teaching moment.** Call out that we are deliberately skipping wireframes. The design pack plus direct implementation is faster and produces a better-aligned result.

**Assistant does.** Creates `live_demo/sandbox/design/` with:
- `style.md` - one page of prose: mood, voice, reasoning behind the choices.
- `palette.html` - rendered color swatches, each labelled with role (background, surface, primary, accent, muted, danger) and hex.
- `typography.html` - rendered type scale (display, h1-h3, body, mono) with real sample text.
- `components.html` - buttons, inputs, a card, a nav bar, rendered in the style.
- `screen-home.html` (and one more screen if the concept warrants it) - static mockup of the primary screen.

All HTML files must be standalone (no build step, no external CSS references). Students open by double-clicking. When done, the assistant lists the files and suggests opening them.

**Facilitator does.** Opens files in browser for the room.

**Checkpoint.** Facilitator signs off (or asks for one round of adjustments).

**Artifacts.** `design/style.md`, `design/palette.html`, `design/typography.html`, `design/components.html`, `design/screen-*.html`.

## Phase 6: Design sign-off (about 3 minutes)

**Goal.** Audience approves the look, or gets one adjustment round.

**Assistant does.** Invites critique. If adjustments are requested, updates the relevant HTML files and calls out what changed.

**Facilitator does.** Moderates critique. Decides when to move on.

**Checkpoint.** Facilitator says the design is signed off.

**Artifacts.** Possibly updated files in `design/`.

## Phase 7: Tech stack consultation (about 5 minutes)

**Goal.** Commit to a stack the room understands the reasoning for.

**Assistant does.** Presents 3-4 options at the altitude of "what each one feels like for a small web app." Non-technical language. Recommends **Svelte 5 + Vite 6 + TypeScript** because it matches the environment already running on this machine (no new installs, fast feedback), and explains what that means in practice. Awaits a decision.

**Facilitator does.** Plays non-technical. Asks the questions the room might have. Signs off.

**Checkpoint.** Stack decision recorded.

**Artifacts.** None yet.

## Phase 8: Planning docs (about 4 minutes)

**Goal.** A roadmap and an architecture doc that will be lived-in during the build.

**Assistant does.** Creates two files:

- `live_demo/sandbox/docs/roadmap.md` - an **optimistic, prioritized** MVP checklist (unchecked boxes), deliberately more than can fit in the build window. Items are ordered top-down by value, so working from the top always yields the most useful partial outcome. Follows with 2-3 "future iterations" sections also as checklists.
- `live_demo/sandbox/docs/architecture.md` - component tree, state/data flow, key decisions with their tradeoffs, and a brief note on the file layout.

**Facilitator does.** Reviews, asks the room if the priority order makes sense (order matters more than length).

**Checkpoint.** Facilitator confirms top-to-bottom priority is right.

**Artifacts.** `docs/roadmap.md`, `docs/architecture.md`.

## Phase 9: Autonomous build (about 15 minutes, the showcase)

**Goal.** Watch the assistant build the MVP, with visible progress and a live status indicator.

**Teaching moment.** This is when the status indicator earns its keep. Point the room at the indicator (top right). Explain what each state means and that the agent is literally telling the presentation what it is doing in real time.

**Teaching moment 2 - shared memory.** As the build progresses, the assistant must tick off items in `docs/roadmap.md` as they land. Call this out to the audience: the roadmap is not a static artifact, it is a shared working document the agent is maintaining. This is how shared memory between the human and the agent is made tangible.

**Assistant does.**
1. Scaffolds `live_demo/sandbox/` as a Svelte 5 + Vite 6 + TypeScript project. Key rule: `vite.config.ts` must set `server.port = 5180` with `strictPort: true` so the demo never collides with the presentation running on 5173 and never silently falls back to another port.
2. Works through the MVP checklist in `docs/roadmap.md` **top to bottom**. After each meaningful slice lands, ticks the box in the roadmap. Commits nothing (the sandbox is git-ignored by design).
3. Works as far down the list as time allows. Does not skip items out of order to "finish the fun ones" - priority order is the contract.
4. Keeps facilitator-audience updates terse. No live play-by-play. The status indicator and the roadmap ticks are doing that job.
5. If blocked or ambiguous, stops and asks.

**Facilitator does.** Narrates the status indicator and roadmap ticks for the room. Switches to the sandbox files view occasionally to show docs being maintained. Can call time at any point, either to pause the build or to move on to launch.

**Checkpoint.** Facilitator calls time (either because enough is ticked off to show something useful, or because we're running into phase 10). `npm run dev` launches cleanly on port 5180.

**Artifacts.** The app source under `live_demo/sandbox/src/`, `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`. Roadmap updated throughout.

## Phase 10: Launch and review (about 4 minutes)

**Goal.** See the thing run; compare against the brief and design pack.

**Assistant does.** Announces the app is ready. Offers to start the dev server (in a background shell) or lets the facilitator do it. Once running, gives a one-paragraph orientation to what to click.

**Facilitator does.** Opens http://localhost:5180 on a second monitor or new tab. Walks the room through the app. Compares to the brief (does it solve the problem?) and the design pack (does it match the look?).

**Checkpoint.** Facilitator says we're done reviewing.

**Artifacts.** None new.

## Phase 11: Wrap-up (about 3 minutes)

**Goal.** Tie the hour back to the talk's themes.

**Assistant does.** Offers a short reflection covering: the shape of the workflow (brief, refine, design, tech decision, roadmap, build, launch), where the shared memory showed up (docs updated during the build), the human judgment points, and an honest read of **what we reached vs what the roadmap planned** - the unticked boxes are the honest "future work" list, not a failure. No sales pitch, just a summary.

**Facilitator does.** Takes final audience questions. Closes.

**Artifacts.** None new.

## Time budget summary

| Phase | Minutes |
|---|---|
| 1. Ideation | 4 |
| 2. Spec drafting | 6 |
| 3. Spec refinement | 3 |
| 4. Style inquiry | 3 |
| 5. Design pack | 8 |
| 6. Design sign-off | 3 |
| 7. Tech stack | 5 |
| 8. Planning docs | 4 |
| 9. Autonomous build | 15 |
| 10. Launch and review | 4 |
| 11. Wrap-up | 3 |
| **Total** | **58** |

Two-minute buffer for transitions and the unexpected.

## Reset between runs

```bash
git clean -fdx live_demo/sandbox/
```

This deletes everything under `sandbox/` except the tracked `.gitkeep`. Safe to run from the repo root. Do this between any two talks so the next one starts from a clean slate.
