// Dev-only Vite plugin that exposes the live_demo/sandbox/ tree to the
// presentation's workspace explorer.
//
//   GET  /_sandbox/tree             -> nested directory tree as JSON
//   GET  /_sandbox/file?path=...    -> raw file contents (text)
//   GET  /_sandbox/live-up          -> { up: boolean } probe of localhost:5180
//   GET  /_sandbox/events           -> SSE push on any file change in sandbox
//
// Paths are always relative to live_demo/sandbox. Directory traversal is
// blocked. Hidden/irrelevant entries (.gitignore, node_modules, dist, .git)
// are filtered out server-side so the client never has to think about them.

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import chokidar from 'chokidar';

const HIDDEN_FILES = new Set(['.gitignore', '.DS_Store']);
const HIDDEN_DIRS = new Set(['node_modules', '.git', 'dist', '.vite']);

function readTree(absDir, rel = '') {
  let entries;
  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true });
  } catch {
    return [];
  }
  const items = [];
  for (const e of entries) {
    const childRel = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (HIDDEN_DIRS.has(e.name)) continue;
      items.push({
        type: 'dir',
        name: e.name,
        path: childRel,
        children: readTree(path.join(absDir, e.name), childRel),
      });
    } else if (e.isFile()) {
      if (HIDDEN_FILES.has(e.name)) continue;
      items.push({
        type: 'file',
        name: e.name,
        path: childRel,
      });
    }
  }
  items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return items;
}

function probeOnce(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      try { req.destroy(); } catch {}
      resolve(false);
    }, timeoutMs);
    const req = http.get({ host, port, path: '/', family: host === '127.0.0.1' ? 4 : 6 }, (res) => {
      clearTimeout(timer);
      res.resume();
      resolve(res.statusCode !== undefined && res.statusCode < 500);
    });
    req.on('error', () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

function isUnder(candidate, base) {
  if (!candidate) return false;
  const n = path.normalize(candidate);
  return n === base || n.startsWith(base + path.sep);
}

async function probeLive(port = 5180, timeoutMs = 500) {
  // Try both IPv4 and IPv6 loopback in parallel; win if either responds.
  // Windows often resolves localhost to ::1, while other tools (and the
  // user's browser iframe) reach 127.0.0.1. Vite picks one depending on
  // `host`, so we probe both.
  const results = await Promise.all([
    probeOnce('127.0.0.1', port, timeoutMs),
    probeOnce('::1', port, timeoutMs),
  ]);
  return results.some(Boolean);
}

export function sandboxPlugin({ root }) {
  const sandboxDir = path.resolve(root, 'live_demo/sandbox');
  const normalizedSandbox = path.normalize(sandboxDir);
  return {
    name: 'sandbox-explorer',
    apply: 'serve',
    // Exclude the sandbox from Vite's own watcher. Without this, a
    // sandbox HTML change triggers Vite's fallback "page reload"
    // behaviour for the presentation, which is exactly what we don't
    // want: the explorer has its own SSE stream for sandbox changes,
    // and Vite should ignore them entirely.
    config() {
      return {
        server: {
          watch: {
            ignored: [
              '**/live_demo/sandbox/**',
            ],
          },
        },
      };
    },
    configureServer(server) {
      const clients = new Set();

      // Dedicated watcher so Vite's HMR pipeline never sees sandbox
      // changes. Hooking into `server.watcher` would cause Vite to
      // trigger full page reloads when sandbox HTML files change, since
      // HTML goes through a separate reload path that handleHotUpdate
      // can't intercept. Keeping it isolated is the clean fix.
      const watcher = chokidar.watch(sandboxDir, {
        ignoreInitial: true,
        ignored: [
          /(^|[\\/])\.git([\\/]|$)/,
          /(^|[\\/])node_modules([\\/]|$)/,
          /(^|[\\/])\.vite([\\/]|$)/,
          /(^|[\\/])dist([\\/]|$)/,
        ],
        awaitWriteFinish: {
          stabilityThreshold: 40,
          pollInterval: 20,
        },
      });

      const notify = (kind, p) => {
        const payload = JSON.stringify({
          type: kind,
          path: path.relative(sandboxDir, p).split(path.sep).join('/'),
          at: Date.now(),
        });
        for (const res of clients) {
          try { res.write(`data: ${payload}\n\n`); } catch { /* ignore */ }
        }
      };

      watcher.on('add',       (p) => notify('add',       p));
      watcher.on('change',    (p) => notify('change',    p));
      watcher.on('unlink',    (p) => notify('unlink',    p));
      watcher.on('addDir',    (p) => notify('addDir',    p));
      watcher.on('unlinkDir', (p) => notify('unlinkDir', p));

      // Close the standalone watcher when Vite shuts down.
      server.httpServer?.once('close', () => {
        watcher.close().catch(() => { /* ignore */ });
      });

      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const parsed = new URL(req.url, 'http://local');

        if (parsed.pathname === '/_sandbox/tree') {
          const tree = fs.existsSync(sandboxDir) ? readTree(sandboxDir) : [];
          res.setHeader('content-type', 'application/json; charset=utf-8');
          res.setHeader('cache-control', 'no-store');
          res.end(JSON.stringify({ root: sandboxDir, tree }));
          return;
        }

        if (parsed.pathname === '/_sandbox/file') {
          const rel = parsed.searchParams.get('path') || '';
          const abs = path.resolve(sandboxDir, rel);
          if (!isUnder(abs, normalizedSandbox)) {
            res.statusCode = 400;
            return res.end('bad path');
          }
          try {
            const stat = fs.statSync(abs);
            if (!stat.isFile()) {
              res.statusCode = 404;
              return res.end('not a file');
            }
            // Cap at ~2 MB to avoid OOM on accidental huge files.
            if (stat.size > 2 * 1024 * 1024) {
              res.statusCode = 413;
              return res.end('file too large');
            }
            const content = fs.readFileSync(abs, 'utf-8');
            res.setHeader('content-type', 'text/plain; charset=utf-8');
            res.setHeader('cache-control', 'no-store');
            res.end(content);
          } catch {
            res.statusCode = 404;
            res.end('not found');
          }
          return;
        }

        if (parsed.pathname === '/_sandbox/live-up') {
          probeLive(5180).then((up) => {
            res.setHeader('content-type', 'application/json; charset=utf-8');
            res.setHeader('cache-control', 'no-store');
            res.end(JSON.stringify({ up }));
          });
          return;
        }

        if (parsed.pathname === '/_sandbox/events') {
          res.writeHead(200, {
            'content-type': 'text/event-stream; charset=utf-8',
            'cache-control': 'no-cache, no-transform',
            connection: 'keep-alive',
            'x-accel-buffering': 'no',
          });
          res.write(`: connected\n\n`);
          clients.add(res);
          req.on('close', () => clients.delete(res));
          return;
        }

        next();
      });
    },
  };
}
