# Live Demo

Space for the live coding segment of the talk. Structured so the talk can be re-run from a clean slate each time.

## Layout

- `instructions/` - this folder. Notes, scripts, prompts, or anything that should survive between talks. Tracked in git.
- `sandbox/` - where the temporary demo project actually lives. Its contents are git-ignored; only `.gitkeep` is tracked so the folder stays in the repo. Reset freely between runs (`rm -rf live_demo/sandbox/* live_demo/sandbox/.* 2>/dev/null`, leaving `.gitkeep`).

## How the status indicator reaches the demo

`.claude/settings.local.json` lives at the repo root, so any Claude Code session started inside `live_demo/sandbox/` inherits the hooks that feed the status indicator. Start the bridge and the dev server via the VS Code `Dev Server` task, open the presentation in the browser, and run Claude Code from inside `live_demo/sandbox/`. The indicator will reflect the demo session.
