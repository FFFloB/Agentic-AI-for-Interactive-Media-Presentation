#!/usr/bin/env node
// Notification-hook filter for the presentation status indicator.
//
// Claude Code fires the Notification hook for both permission prompts and
// idle-timeout warnings ("you've been quiet, check on me"). Only the first
// of those is genuinely input-needed from the model's perspective; the
// idle warning is really about the human. This script reads the event
// JSON from stdin, and only POSTs input-needed when the message looks
// like a permission prompt. Fails silently in every error path so a
// hook issue never blocks a session.

import http from 'node:http';

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  try {
    const evt = JSON.parse(raw || '{}');
    const msg = String(evt.message || '').toLowerCase();
    // Permission prompts say "... needs your permission ...". Idle
    // warnings say "... waiting for your input". Match on 'permission'
    // only - if Claude Code changes the idle wording we still won't
    // false-positive on it.
    if (!msg.includes('permission')) return;
    postStatus('input-needed');
  } catch {
    /* malformed payload: do nothing */
  }
});

function postStatus(status) {
  const req = http.request({
    host: '127.0.0.1',
    port: 7321,
    path: `/status/${status}`,
    method: 'POST',
    timeout: 1000
  }, (res) => { res.resume(); });
  req.on('error', () => { /* bridge not running */ });
  req.on('timeout', () => { req.destroy(); });
  req.end();
}
