#!/usr/bin/env node
// Status bridge: receives Claude Code hook pings and streams the current
// status to the presentation UI via Server-Sent Events. Zero runtime deps.
//
// Endpoints:
//   POST /status/{ready|working|input-needed}  (hook calls this via curl)
//   GET  /events                               (SSE stream for the UI)
//   GET  /healthz                              (plain 200 OK)

import http from 'node:http';

const PORT = Number(process.env.STATUS_BRIDGE_PORT) || 7321;
const VALID = new Set(['ready', 'working', 'input-needed']);

let current = { status: 'ready', ts: Date.now() };
const clients = new Set();

function broadcast() {
  const payload = `data: ${JSON.stringify(current)}\n\n`;
  for (const res of clients) {
    try { res.write(payload); } catch { /* client gone; cleaned up on close */ }
  }
}

function setStatus(status) {
  if (!VALID.has(status)) return false;
  current = { status, ts: Date.now() };
  broadcast();
  return true;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain', ...corsHeaders() });
    res.end('ok');
    return;
  }

  if (req.method === 'POST' && url.pathname.startsWith('/status/')) {
    const status = url.pathname.slice('/status/'.length);
    const ok = setStatus(status);
    res.writeHead(ok ? 200 : 400, { 'Content-Type': 'application/json', ...corsHeaders() });
    res.end(JSON.stringify(ok ? current : { error: 'invalid status', valid: [...VALID] }));
    // Silently drain request body if any.
    req.resume();
    if (ok) console.log(`[status-bridge] -> ${status}`);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...corsHeaders()
    });
    res.write(`retry: 2000\n\n`);
    res.write(`data: ${JSON.stringify(current)}\n\n`);
    clients.add(res);
    const ping = setInterval(() => {
      try { res.write(`: ping\n\n`); } catch { /* handled on close */ }
    }, 20000);
    req.on('close', () => {
      clearInterval(ping);
      clients.delete(res);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain', ...corsHeaders() });
  res.end('not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[status-bridge] listening on http://127.0.0.1:${PORT}`);
  console.log(`[status-bridge] SSE: GET /events  |  hook: POST /status/{ready|working|input-needed}`);
});
