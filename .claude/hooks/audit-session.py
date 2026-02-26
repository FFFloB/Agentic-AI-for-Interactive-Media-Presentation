#!/usr/bin/env python3
"""
Claude Code session audit logger.

Copies the full session transcript (including thinking blocks, prompts,
tool use, and responses) to session_audits/ on every Stop and SessionEnd event.

Transcript format: JSONL (one JSON object per line) — Claude Code's native format.
"""

import sys
import json
import os
import shutil
from datetime import datetime


def main():
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    audit_dir = os.path.join(project_dir, "session_audits")
    os.makedirs(audit_dir, exist_ok=True)

    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        return

    event = data.get("hook_event_name", "")
    session_id = data.get("session_id", "unknown")
    transcript_path = data.get("transcript_path", "")

    # Avoid Stop hook infinite loops
    if event == "Stop" and data.get("stop_hook_active"):
        return

    # Marker file tracks when this session started (for stable filenames)
    marker = os.path.join(audit_dir, f".{session_id}.start")
    short_id = session_id[:8] if len(session_id) > 8 else session_id

    if event == "SessionStart":
        ts = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        with open(marker, "w") as f:
            f.write(ts)
        # Write a small initial metadata file
        out = os.path.join(audit_dir, f"{ts}_{short_id}.jsonl")
        with open(out, "w") as f:
            f.write(json.dumps({
                "event": "session_start",
                "timestamp": ts,
                "session_id": session_id,
                "source": data.get("source", "unknown"),
                "model": data.get("model", "unknown"),
            }) + "\n")
        return

    # Resolve the stable filename for this session
    if os.path.exists(marker):
        with open(marker) as f:
            ts = f.read().strip()
    else:
        # No marker yet (hook added mid-session) — create one now
        ts = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        with open(marker, "w") as f:
            f.write(ts)

    out = os.path.join(audit_dir, f"{ts}_{short_id}.jsonl")

    # Copy the full transcript on Stop or SessionEnd
    if transcript_path and os.path.exists(transcript_path):
        shutil.copy2(transcript_path, out)

    # Clean up marker on SessionEnd
    if event == "SessionEnd":
        try:
            os.remove(marker)
        except OSError:
            pass


if __name__ == "__main__":
    main()
