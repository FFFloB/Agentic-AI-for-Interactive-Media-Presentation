# CLAUDE.md

## Project Conventions

- **Documentation**: Keep all project docs (`project_info.md`, `technical_info.md`, `design_guide.md`, `key_decisions.md`, `key_learnings.md`) up to date with every significant change.
- **Session logging**: Use `/logsession` at the end of each session to append contributions to [`session_log.md`](session_log.md). This is the single source of truth for the contribution log. Can also be run retrospectively from audit files.

## Git Use

- **Commit tagging**: Claude's commits use standard messages. Human commits should be identifiable — if unclear, Claude will ask.
- **Commit frequency**: Commit frequently in meaningful batches after changes. Commit updates to the session_audits separately, but only commit sessions that have been concluded - avoid tracking sessions as they are ongoing, this history is not meaningful.

