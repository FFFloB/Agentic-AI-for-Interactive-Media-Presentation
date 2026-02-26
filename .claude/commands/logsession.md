Append the current session to `session_log.md` and commit concluded session audits.

Steps:
1. Read `session_log.md` to find the last session number and determine the next one.
2. List `session_audits/` to find the audit file for this session (match by session ID or most recent file).
3. Review the conversation so far and identify all meaningful contributions from both Human and Claude.
4. Append a new session section to `session_log.md` with:
   - Session heading: `## Session N — YYYY-MM-DD`
   - Audit file link: `**Audit file**: [path](path)`
   - Contribution table with numbered rows continuing from the last session's numbering
5. Commit the updated `session_log.md`.
6. Commit concluded session audit files (see below).

## Cleaning up stale `.start` markers

Before committing, detect and clean up stale `.start` files — orphans left behind by sessions that crashed or were killed without triggering the cleanup hook.

1. Identify the current session's `.start` file (matches the current audit's 8-char ID).
2. For every OTHER `.start` file, check the modification time of its corresponding `.jsonl` (if one exists):
   - If no `.jsonl` exists at all → **stale** (session never produced output).
   - If the `.jsonl` hasn't been modified in the last 10 minutes → **stale** (session is no longer writing).
   - Otherwise → treat as active (another session may be running concurrently).
3. Delete any stale `.start` files and report which ones were cleaned up.

## Committing concluded session audits

After cleanup, automatically commit any concluded audit files:

1. List all `.jsonl` files in `session_audits/`.
2. For each `.jsonl` file, extract the 8-char session ID from the filename (pattern: `YYYY-MM-DD_HH-MM-SS_{id}.jsonl`).
3. Check if a matching `.start` file still exists (pattern: `.{uuid}.start` where the UUID starts with that 8-char ID). If a `.start` file exists, the session is still active — skip it.
4. Stage and commit all concluded (no `.start` file) `.jsonl` files that have uncommitted changes, in a single commit with message: `Log concluded session audits`.
5. Do NOT commit or stage `.start` files, `.gitkeep`, or any active session's `.jsonl`.

## Notes

- If a session audit file hasn't been generated yet (session still active), note the expected filename pattern (`YYYY-MM-DD_HH-MM-SS_{8-char-id}.jsonl`) and leave the link to be confirmed.
- For retrospective logging: if asked to log a past session, read the audit JSONL file to reconstruct contributions.
