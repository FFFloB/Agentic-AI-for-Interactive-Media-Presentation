Append the current session to `session_log.md`.

Steps:
1. Read `session_log.md` to find the last session number and determine the next one.
2. List `session_audits/` to find the audit file for this session (match by session ID or most recent file).
3. Review the conversation so far and identify all meaningful contributions from both Human and Claude.
4. Append a new session section to `session_log.md` with:
   - Session heading: `## Session N — YYYY-MM-DD`
   - Audit file link: `**Audit file**: [path](path)`
   - Contribution table with numbered rows continuing from the last session's numbering
5. Commit the updated `session_log.md`.

If a session audit file hasn't been generated yet (session still active), note the expected filename pattern (`YYYY-MM-DD_HH-MM-SS_{8-char-id}.jsonl`) and leave the link to be confirmed.

For retrospective logging: if asked to log a past session, read the audit JSONL file to reconstruct contributions.
