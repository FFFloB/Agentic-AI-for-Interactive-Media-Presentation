# CLAUDE.md

## Project Conventions

- **Documentation**: Keep all project docs in [`docs/`](docs/) (`project_info.md`, `technical_info.md`, `design_guide.md`, `key_decisions.md`, `key_learnings.md`) up to date with every significant change.
- **Session logging**: Use `/logsession` at the end of each session to append contributions to [`docs/session_log.md`](docs/session_log.md). This is the single source of truth for the contribution log. Can also be run retrospectively from audit files.

## Git Use

- **Commit tagging**: Claude's commits include a `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` trailer. Human commits won't have this trailer. Detailed per-contribution attribution lives in `docs/session_log.md`.
- **Commit frequency**: Commit frequently in meaningful batches after changes. Commit updates to the session_audits separately, but only commit sessions that have been concluded - avoid tracking sessions as they are ongoing, this history is not meaningful.

