# CLAUDE.md

## Project Conventions

- **Commit tagging**: Claude's commits use standard messages. Human commits should be identifiable — if unclear, Claude will ask.
- **Documentation**: Keep all project docs (`project_info.md`, `technical_info.md`, `design_guide.md`, `key_decisions.md`, `key_learnings.md`) up to date with every significant change.
- **Session summaries**: After each session, append a summary to [`session_log.md`](session_log.md) with a link to the corresponding audit file in `session_audits/`.
- **Commit frequency**: Commit frequently in meaningful batches after changes.

---

## Contribution Log

This log tracks every contribution from both Claude and the human collaborator. It must never be compressed or summarized away.

### Session 1 — 2026-02-26

| # | Who | Contribution |
|---|-----|-------------|
| 1 | Human | Provided initial prompt defining the project vision: a canvas-based presentation with scripted walkthroughs, interactive focus elements, modern minimalist design, and parallax generative backgrounds. Defined documentation structure and contribution logging requirements. |
| 2 | Claude | Created project scaffolding: `initial_prompt.md`, `CLAUDE.md`, `project_info.md`, `technical_info.md`, `design_guide.md`, `key_decisions.md`, `key_learnings.md`. Initialized git repository and made initial commit. |
| 3 | Human | Requested automatic session audit logging — full transcripts (including thinking steps) saved to `session_audits/`, one file per session, structured JSONL, committed to git. |
| 4 | Claude | Implemented session audit system: `.claude/hooks/audit-session.py` (copies full transcript on Stop/SessionEnd), `.claude/settings.json` (project-level hooks config), `session_audits/` directory. Updated `.gitignore` for temp markers. |

### Session 2 — 2026-02-26

| # | Who | Contribution |
|---|-----|-------------|
| 5 | Human | Clarified session logging: session summaries should live in `session_log.md` and link to the respective session audit files. |
| 6 | Claude | Created `session_log.md` with per-session summaries linking to audit files. Added "Session summaries" convention to `CLAUDE.md`. |
