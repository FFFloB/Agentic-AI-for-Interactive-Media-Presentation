#!/usr/bin/env node
// Preprocess session_audits/*.jsonl into a compact TypeScript data file
// consumed by the care-audit segment. Runtime parsing of 3442+ lines would
// be slow and would put the whole raw transcript in the bundle; this
// extracts only what the timeline and the on-demand detail view need.
//
// Run: node scripts/build-audit-data.mjs
// (or: pnpm exec tsx ... etc.) Regenerate after finishing a new session.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IN_DIR = path.join(ROOT, 'session_audits');
const OUT_FILE = path.join(
  ROOT,
  'src',
  'content',
  'segments',
  'care-audit',
  'data.ts',
);

// --- Helpers ----------------------------------------------------------------

function truncate(s, max = 140) {
  if (!s) return '';
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

function wordCount(s) {
  if (!s) return 0;
  return s.split(/\s+/).filter(Boolean).length;
}

// Model: how long a human plausibly spent composing a prompt of N words.
// Calibrated from the distribution of "enclosed" user queries in the
// actual session logs - ones where we can measure the real gap between
// the previous AI output and the prompt timestamp. Observed medians were
// ~6s/word for short prompts dropping to ~3.5s/word for longer ones, with
// a ~15-20s reading/thinking base. We use a single linear rate that sits
// in the middle of that range, plus a base.
const HUMAN_BASE_MS = 20_000;
const HUMAN_PER_WORD_MS = 4_000;
const HUMAN_MAX_MS = 15 * 60_000; // cap the guess at 15 minutes

function expectedHumanDur(text) {
  return Math.min(
    HUMAN_MAX_MS,
    HUMAN_BASE_MS + HUMAN_PER_WORD_MS * wordCount(text),
  );
}

// A user prompt took suspiciously longer than its word count would
// reasonably justify -> human went AFK and we should split the session
// at this prompt. Factor + floor combined so brief "took 4 minutes to
// type a sentence" variance doesn't trip the split.
const AFK_FACTOR = 3;
const AFK_FLOOR_MS = 4 * 60_000;

function isAfkBreak(actualMs, text) {
  const expected = expectedHumanDur(text);
  return actualMs > Math.max(expected * AFK_FACTOR, AFK_FLOOR_MS);
}

// Synthetic prompt detection. When the user runs a slash-command (like
// /clear, /logsession) or the CLI injects a local-command-caveat wrapper,
// those come through as "user" prompts even though nobody typed prose.
// We still count them as events (they mark real activity / breaks) but
// we don't want them as the session title.
function isSyntheticPrompt(text) {
  if (!text) return true;
  // Harness-emitted wrappers that land as "user" content but aren't
  // human-typed prose. Catalogued from actual session data:
  //   <command-name>, <command-message>       slash-command invocation
  //   <local-command-caveat>, <local-command-stdout>  CLI-injected metadata
  //   <task-notification>                    async agent completion relays
  //   <system-reminder>                      harness-injected reminders
  if (text.includes('<command-name>')) return true;
  if (text.includes('<command-message>')) return true;
  if (text.includes('<local-command-')) return true;
  if (text.includes('<task-notification>')) return true;
  if (text.includes('<system-reminder>')) return true;
  // A bare slash-command with no prose after it.
  const trimmed = text.trim();
  if (/^\/[a-z][a-z0-9\-]*\s*$/i.test(trimmed)) return true;
  return false;
}

function extractUserText(obj) {
  const msg = obj.message;
  if (!msg) return '';
  if (typeof msg.content === 'string') return msg.content;
  if (Array.isArray(msg.content)) {
    return msg.content
      .filter((b) => b && b.type === 'text')
      .map((b) => b.text || '')
      .join(' ');
  }
  return '';
}

function extractAssistantBlocks(obj) {
  // Returns an array of { kind: 'text' | 'thinking' | 'tool', ...fields }
  const msg = obj.message;
  if (!msg || !Array.isArray(msg.content)) return [];
  const out = [];
  for (const b of msg.content) {
    if (!b || typeof b !== 'object') continue;
    if (b.type === 'text' && b.text) {
      out.push({ kind: 'text', text: b.text });
    } else if (b.type === 'thinking') {
      // Extended thinking blocks often arrive signature-only: the transcript
      // keeps a cryptographic verification token but the plaintext is
      // stripped. Still a thought, still worth recording on the timeline;
      // the detail panel can show an honest "content not retained" label.
      if (b.thinking) {
        out.push({ kind: 'thinking', text: b.thinking });
      } else {
        out.push({ kind: 'thinking', redacted: true });
      }
    } else if (b.type === 'tool_use') {
      const label = summariseToolInput(b.name, b.input);
      out.push({ kind: 'tool', tool: b.name || '?', label, input: b.input });
    }
  }
  return out;
}

function summariseToolInput(name, input) {
  if (!input || typeof input !== 'object') return '';
  switch (name) {
    case 'Read':
    case 'Write':
      return input.file_path || input.filePath || '';
    case 'Edit':
      return input.file_path || input.filePath || '';
    case 'Bash':
    case 'PowerShell':
      return truncate(input.command || '', 80);
    case 'Grep':
      return `${input.pattern || ''}${input.glob ? '  in ' + input.glob : ''}`;
    case 'Glob':
      return input.pattern || '';
    case 'TaskCreate':
      return truncate(input.subject || '', 80);
    case 'TaskUpdate':
      return `${input.taskId || ''} → ${input.status || ''}`;
    case 'WebFetch':
      return input.url || '';
    case 'ToolSearch':
      return truncate(input.query || '', 60);
    case 'Agent':
      return truncate(input.description || '', 80);
    default:
      return '';
  }
}

// --- Per-file processing ----------------------------------------------------

function processFile(fullPath) {
  const basename = path.basename(fullPath, '.jsonl');
  const raw = fs.readFileSync(fullPath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(Boolean);

  // Pass 1: parse every record we care about and keep enough state to
  // resolve tool_use -> tool_result pairs later.
  // We record: user prompts, all assistant blocks (thinking / text /
  // tool_use), and tool_result timestamps keyed by tool_use_id.
  const records = []; // { t, kind, payload }
  const toolResults = new Map(); // tool_use_id -> result timestamp
  let startMs = Infinity;
  let endMs = -Infinity;

  for (const line of lines) {
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    const tsRaw = obj.timestamp;
    if (!tsRaw) continue;
    const t = Date.parse(tsRaw);
    if (Number.isNaN(t)) continue;
    if (t < startMs) startMs = t;
    if (t > endMs) endMs = t;

    if (obj.type === 'user') {
      const content = obj.message?.content;
      // Tool-result records come through as "user" with content[0] being a
      // tool_result. Capture their timestamp so we can close out the
      // matching tool_use bar, then skip emitting them as events.
      if (
        Array.isArray(content) &&
        content[0]?.type === 'tool_result' &&
        content[0]?.tool_use_id
      ) {
        toolResults.set(content[0].tool_use_id, t);
        continue;
      }
      const text = extractUserText(obj);
      if (!text) continue;
      // Slash-commands and CLI-injected wrappers (<command-name>,
      // <local-command-caveat>, etc.) are harness-generated metadata,
      // not human prose. They're noisy in the timeline and misleading in
      // the detail view (shown as "user" activity when the human typed
      // almost nothing). Drop them from the event stream; their
      // timestamps are still implicitly visible as gaps between real
      // events if you zoom in far enough.
      if (isSyntheticPrompt(text)) continue;
      records.push({ t, kind: 'user', text: truncate(text, 600) });
    } else if (obj.type === 'assistant') {
      const msg = obj.message;
      if (!msg || !Array.isArray(msg.content)) continue;
      for (const b of msg.content) {
        if (!b || typeof b !== 'object') continue;
        if (b.type === 'text' && b.text) {
          records.push({ t, kind: 'assistant', text: truncate(b.text, 600) });
        } else if (b.type === 'thinking') {
          if (b.thinking) {
            records.push({
              t,
              kind: 'thinking',
              text: truncate(b.thinking, 400),
            });
          } else {
            records.push({ t, kind: 'thinking', redacted: true });
          }
        } else if (b.type === 'tool_use') {
          records.push({
            t,
            kind: 'tool',
            tool: b.name || '?',
            label: truncate(summariseToolInput(b.name, b.input), 100),
            toolUseId: b.id,
          });
        }
      }
    }
  }

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;
  if (records.length === 0) return null;

  records.sort((a, b) => a.t - b.t);

  // Split the file at "I went away from the PC" gaps. Rather than a
  // fixed minute threshold, decide on a per-query basis: if the measured
  // gap before a user prompt is WAY longer than the human could plausibly
  // have needed to compose that prompt, the gap is AFK time. A two-word
  // "yes please" followed by a 10-minute wait is a break. A 400-word
  // prompt that took 18 minutes to write is not.
  const chunks = [];
  let cur = [records[0]];
  for (let i = 1; i < records.length; i++) {
    const r = records[i];
    const prev = records[i - 1];
    if (r.kind === 'user' && isAfkBreak(r.t - prev.t, r.text)) {
      chunks.push(cur);
      cur = [r];
    } else {
      cur.push(r);
    }
  }
  chunks.push(cur);

  return chunks
    .map((chunkRecords, chunkIdx) =>
      buildSessionFromChunk(
        basename,
        chunkRecords,
        chunkIdx,
        chunks.length,
        toolResults,
      ),
    )
    .filter(Boolean);
}

function buildSessionFromChunk(basename, records, chunkIdx, chunkCount, toolResults) {
  if (records.length === 0) return null;

  // If the first record is a user prompt, the human began composing it
  // *before* the transcript's first timestamp (the log captures when the
  // prompt was sent, not when typing started). Shift the session's logical
  // start back by the estimated composition time so the bar representing
  // that work fits inside the block instead of painting off the left edge.
  const first = records[0];
  let firstDur = 0;
  if (first.kind === 'user' && first.text) {
    firstDur = expectedHumanDur(first.text);
  }
  const chunkStartMs = first.t - firstDur;
  const chunkEndMs = records[records.length - 1].t;

  // Pass 2: assign a duration to each event.
  //
  // The rule is "duration of the activity that ENDS at this event":
  //   - user prompt: how long the user spent between the previous event
  //     and sending the prompt (reading / typing / thinking).
  //   - assistant text: time since the previous event (usually the user
  //     prompt, or a tool_result if this text follows a tool call).
  //   - thinking: time since the previous event - approximates "how long
  //     the model worked before emitting its first thought".
  //   - tool use: exact execution time from tool_use -> tool_result.
  //
  // Durations are clamped to a minimum of 1ms so the renderer can always
  // give the bar a minimum visible width downstream.
  //
  // Special case: the *first* event of a chunk has no measurable
  // duration (we don't know when the human returned to the keyboard).
  // If it's a user prompt we use the calibrated word-count model
  // (expectedHumanDur) as an informed estimate; otherwise zero.

  const events = [];
  const stats = { user: 0, assistant: 0, tools: 0 };
  // Prefer a "substantive" prompt for the title (i.e. not a /clear or a
  // local-command-caveat wrapper). Keep the first-of-any as a fallback.
  let firstPrompt = '';
  let firstAnyPrompt = '';
  let prevT = chunkStartMs;
  let isFirstRecord = true;

  // Find a sensible reference set for the ID (tool_use results may live
  // outside the chunk, but we keep tool->result matching intact since
  // the outer scope toolResults map is complete for the file).
  for (const r of records) {
    let dur;
    if (isFirstRecord) {
      // firstDur was computed above (zero if the first record isn't a
      // user prompt). chunkStartMs has already been shifted back so the
      // bar [t - firstDur, t] sits entirely inside the session block.
      dur = firstDur;
      isFirstRecord = false;
    } else if (r.kind === 'tool' && r.toolUseId && toolResults.has(r.toolUseId)) {
      dur = Math.max(1, toolResults.get(r.toolUseId) - r.t);
    } else {
      dur = Math.max(1, r.t - prevT);
    }

    const ev = {
      t: r.t - chunkStartMs,
      dur,
      kind: r.kind,
    };
    if (r.text !== undefined) ev.text = r.text;
    if (r.tool !== undefined) ev.tool = r.tool;
    if (r.label !== undefined) ev.label = r.label;
    if (r.redacted) ev.redacted = true;

    if (r.kind === 'user') {
      stats.user++;
      if (r.text) {
        if (!firstAnyPrompt) firstAnyPrompt = r.text;
        if (!firstPrompt && !isSyntheticPrompt(r.text)) firstPrompt = r.text;
      }
    } else if (r.kind === 'assistant') {
      stats.assistant++;
    } else if (r.kind === 'tool') {
      stats.tools++;
    }

    events.push(ev);
    prevT = r.t;
  }

  const id = chunkCount > 1 ? `${basename}#${chunkIdx + 1}` : basename;
  const titleCore =
    truncate(firstPrompt || firstAnyPrompt || '', 140) || '(no prompts)';
  const title =
    chunkCount > 1 && chunkIdx > 0 ? `Resumed · ${truncate(titleCore, 130)}` : titleCore;

  return {
    id,
    title,
    startMs: chunkStartMs,
    endMs: chunkEndMs,
    durationMs: chunkEndMs - chunkStartMs,
    events,
    stats,
  };
}

// --- Main -------------------------------------------------------------------

function main() {
  const files = fs
    .readdirSync(IN_DIR)
    .filter((f) => f.endsWith('.jsonl'))
    .sort();

  const sessions = [];
  for (const f of files) {
    const result = processFile(path.join(IN_DIR, f));
    if (!result) continue;
    // processFile now returns an array (one entry per chunk after AFK
    // splitting). Flatten back into the global session list.
    if (Array.isArray(result)) {
      for (const s of result) if (s) sessions.push(s);
    } else {
      sessions.push(result);
    }
  }
  sessions.sort((a, b) => a.startMs - b.startMs);

  const firstMs = sessions[0]?.startMs ?? 0;
  const lastMs = sessions.reduce((m, s) => Math.max(m, s.endMs), firstMs);

  const header = `// AUTO-GENERATED by scripts/build-audit-data.mjs - do not edit by hand.
// Source: session_audits/*.jsonl. Regenerate after each concluded session.

export type AuditEventKind = 'user' | 'assistant' | 'thinking' | 'tool';

export interface AuditEvent {
  /** ms offset from the session's start - the END of this activity */
  t: number;
  /** ms duration of the activity that ended at t.
   * tool: exact execution time. Everything else: gap since the previous
   * event, which approximates the wall-clock time spent on that activity. */
  dur: number;
  kind: AuditEventKind;
  /** assistant/user/thinking carry text; tool carries tool + label */
  text?: string;
  tool?: string;
  label?: string;
  /** true when the event was recorded as a signature-only thinking block:
   * we know the thought happened but have no plaintext to show. */
  redacted?: boolean;
}

export interface AuditSession {
  id: string;
  title: string;
  /** absolute epoch ms */
  startMs: number;
  endMs: number;
  durationMs: number;
  events: AuditEvent[];
  stats: { user: number; assistant: number; tools: number };
}

export interface AuditData {
  /** earliest session start, epoch ms */
  firstMs: number;
  /** latest session end, epoch ms */
  lastMs: number;
  sessions: AuditSession[];
}

`;

  const body = `export const AUDIT_DATA: AuditData = ${JSON.stringify(
    { firstMs, lastMs, sessions },
    null,
    2,
  )};\n`;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, header + body, 'utf-8');

  // Stderr summary
  const totalEvents = sessions.reduce((a, s) => a + s.events.length, 0);
  const span =
    (lastMs - firstMs) / (1000 * 60 * 60 * 24);
  console.error(
    `audit-data: ${sessions.length} sessions, ${totalEvents} events, ${span.toFixed(
      1,
    )} days span → ${path.relative(ROOT, OUT_FILE)}`,
  );
}

main();
