# CLAUDE.md

## Project Conventions

- **Documentation**: Keep all project docs in [`docs/`](docs/) (`project_info.md`, `technical_info.md`, `design_guide.md`, `key_decisions.md`, `key_learnings.md`) up to date with every significant change.
- **Session logging**: Use `/logsession` at the end of each session to append contributions to [`docs/session_log.md`](docs/session_log.md). This is the single source of truth for the contribution log. Can also be run retrospectively from audit files.

## Writing Style

- **No long dashes**: Never use em-dashes (`—`) or en-dashes (`–`) in any presented content (ads, emails, documentation copy, slide text, etc.). Use hyphens (`-`), commas, or rephrase.
- **Provider-agnostic content**: The talk itself must not name or favour any specific AI provider or product. No "Claude", "ChatGPT", "Gemini", "Anthropic", "OpenAI", "CLAUDE.md", etc. in any presented content (slide copy, segments, sample text, screenshots). Use generic terms like "the model", "the agent", "memory file", "assistant". This rule applies to everything the audience will see; project-internal files (this CLAUDE.md, commit trailers, tooling configs) are exempt.

## Audience Modes

The presentation has two audience modes (`'design'` | `'technical'`), switched via `?mode=technical` in the URL (design is default). Content is split into:

- **Common denominator, hand-authored, never mode-switched**: headlines (h1), subheadlines (segment subhead), section labels, callout labels + bodies, takeaway copy, tier/paradigm/phase blurbs. These are the load-bearing argument and stay identical across modes. Do not template them.
- **Exemplars, mode-templated**: concrete scenario content that differs by audience - user prompts in bubbles, code/file samples in cards, file paths, example asks in a tiers card, and any line where the *example* of "what one of these looks like" would genuinely differ between a designer and a developer.

When in doubt, ask. Drift on this rule dilutes the talk's spine.

## Git Use

- **Commit tagging**: Claude's commits include a `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` trailer. Human commits won't have this trailer. Detailed per-contribution attribution lives in `docs/session_log.md`.
- **Commit frequency**: Commit frequently, in small, meaningful batches as work is completed - ideally after each focused change (a new segment, a bug fix, a design pass). Do not let many unrelated changes pile up in a single commit; smaller, well-scoped commits make file-level progress easier to track and revert. Commit updates to the session_audits separately, but only commit sessions that have been concluded - avoid tracking sessions as they are ongoing, this history is not meaningful.

