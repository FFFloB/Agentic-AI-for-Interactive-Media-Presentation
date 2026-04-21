Regenerate the session-audit visualisation data used by the `care-audit` presentation segment.

Run this any time:

- A new session has concluded (its audit file has been committed).
- You adjust the data model or the preprocessor heuristics (AFK detection, duration model, synthetic-prompt filter) in `scripts/build-audit-data.mjs`.
- The audit visualisation looks stale or out of sync with `session_audits/`.

Steps:

1. Run the preprocessor: `node scripts/build-audit-data.mjs`
2. Confirm the reported summary line (e.g. `audit-data: N sessions, M events, X days span → src\content\segments\care-audit\data.ts`). If the numbers look suspicious, re-check the `session_audits/` folder for missing or corrupt files before proceeding.
3. Run `npm run check` to confirm the regenerated `data.ts` still type-checks against the segment's expected schema.
4. Do NOT commit `data.ts` as part of this command. Regeneration is a local/ephemeral step; commit only when the user explicitly asks for it (usually bundled with a session-log commit).

## Notes

- The preprocessor reads every `session_audits/*.jsonl` and writes a single `src/content/segments/care-audit/data.ts` file.
- Session splitting, duration inference, synthetic-prompt filtering, and title derivation all happen at this preprocessing step - never at runtime.
- The tunable constants live at the top of `scripts/build-audit-data.mjs`:
  - `HUMAN_BASE_MS`, `HUMAN_PER_WORD_MS`, `HUMAN_MAX_MS` - typing-time model
  - `AFK_FACTOR`, `AFK_FLOOR_MS` - session split sensitivity
  - `isSyntheticPrompt()` - wrapper patterns to drop from the human track
- If the user asks for different behaviour (e.g. more aggressive splitting, longer fade, different synthetic wrappers), edit the preprocessor and rerun this command.
