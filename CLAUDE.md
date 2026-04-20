# CLAUDE.md

## Project Conventions

- **Documentation**: Keep all project docs in [`docs/`](docs/) (`project_info.md`, `technical_info.md`, `design_guide.md`, `key_decisions.md`, `key_learnings.md`) up to date with every significant change.
- **Session logging**: Use `/logsession` at the end of each session to append contributions to [`docs/session_log.md`](docs/session_log.md). This is the single source of truth for the contribution log. Can also be run retrospectively from audit files.

## Writing Style

- **No long dashes**: Never use em-dashes (`—`) or en-dashes (`–`) in any presented content (ads, emails, documentation copy, slide text, etc.). Use hyphens (`-`), commas, or rephrase.

## Git Use

- **Commit tagging**: Claude's commits include a `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` trailer. Human commits won't have this trailer. Detailed per-contribution attribution lives in `docs/session_log.md`.
- **Commit frequency**: Commit frequently, in small, meaningful batches as work is completed - ideally after each focused change (a new segment, a bug fix, a design pass). Do not let many unrelated changes pile up in a single commit; smaller, well-scoped commits make file-level progress easier to track and revert. Commit updates to the session_audits separately, but only commit sessions that have been concluded - avoid tracking sessions as they are ongoing, this history is not meaningful.

