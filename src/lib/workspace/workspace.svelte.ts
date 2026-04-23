// Shared state for the workspace explorer: tree, open file, and
// reachability of the live app on port 5180. Populated from the
// /_sandbox/* endpoints exposed by scripts/sandbox-plugin.mjs.

export type TreeNode =
  | { type: 'dir';  name: string; path: string; children: TreeNode[] }
  | { type: 'file'; name: string; path: string };

type ViewTarget =
  | { kind: 'none' }
  | { kind: 'file'; path: string }
  | { kind: 'live-app' };

class WorkspaceState {
  isOpen = $state(false);
  tree = $state<TreeNode[]>([]);
  target = $state<ViewTarget>({ kind: 'none' });
  liveUp = $state(false);
  bridgeAvailable = $state(false);
  expanded = $state<Record<string, boolean>>({});

  // Paths (files only) that have been added or changed since the
  // explorer was last closed. Tracked only while isOpen === false.
  // A marker is cleared when the user views the file, and any
  // remaining markers are wiped when the explorer is closed again.
  changedPaths = $state<Record<string, true>>({});

  private evtSource: EventSource | null = null;
  private livePollTimer: number | null = null;
  private fileCache = new Map<string, string>();

  async init() {
    await this.refreshTree();
    // If the first tree fetch failed, we're almost certainly running
    // outside the dev server (e.g. the single-file build opened from
    // disk). Don't start the SSE stream or the live-app poll loop
    // in that case; they would spam failing requests indefinitely.
    if (!this.bridgeAvailable) return;
    this.connectEvents();
    this.startLivePolling();
  }

  teardown() {
    this.evtSource?.close();
    this.evtSource = null;
    if (this.livePollTimer !== null) {
      clearInterval(this.livePollTimer);
      this.livePollTimer = null;
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    // Badge on the FAB disappears once the panel is open, but individual
    // dots remain on files until the user views them. We do NOT clear
    // changedPaths here.
  }

  close() {
    this.isOpen = false;
    // All pending change markers are wiped when the explorer is hidden,
    // so the badge count starts fresh the next time changes arrive.
    this.changedPaths = {};
  }

  async refreshTree() {
    try {
      const res = await fetch('/_sandbox/tree', { cache: 'no-store' });
      if (!res.ok) throw new Error('bad status');
      const data = await res.json();
      this.tree = data.tree ?? [];
      this.bridgeAvailable = true;
      this.autoExpandInitial();
      // If the currently-previewed file has disappeared, close the preview.
      if (this.target.kind === 'file' && !this.pathExists(this.target.path)) {
        this.target = { kind: 'none' };
      }
      // Prune change markers for paths that no longer exist.
      const pruned: Record<string, true> = {};
      for (const p of Object.keys(this.changedPaths)) {
        if (this.pathExists(p)) pruned[p] = true;
      }
      if (Object.keys(pruned).length !== Object.keys(this.changedPaths).length) {
        this.changedPaths = pruned;
      }
    } catch {
      this.bridgeAvailable = false;
      this.tree = [];
    }
  }

  private pathExists(targetPath: string): boolean {
    const walk = (nodes: TreeNode[]): boolean => {
      for (const n of nodes) {
        if (n.path === targetPath) return true;
        if (n.type === 'dir' && walk(n.children)) return true;
      }
      return false;
    };
    return walk(this.tree);
  }

  private autoExpandInitial() {
    // On first load, auto-open the top-level dirs so the tree isn't a
    // single collapsed root-hidden mystery. Only if the user hasn't
    // manually collapsed anything yet.
    if (Object.keys(this.expanded).length > 0) return;
    const next: Record<string, boolean> = {};
    for (const node of this.tree) {
      if (node.type === 'dir') next[node.path] = true;
    }
    this.expanded = next;
  }

  toggleDir(path: string) {
    this.expanded = { ...this.expanded, [path]: !this.expanded[path] };
  }

  openFile(path: string) {
    this.target = { kind: 'file', path };
    this.fileCache.delete(path);
    this.clearChangeMark(path);
  }

  openLiveApp() {
    this.target = { kind: 'live-app' };
  }

  closeTarget() {
    this.target = { kind: 'none' };
  }

  private clearChangeMark(path: string) {
    if (!this.changedPaths[path]) return;
    const next = { ...this.changedPaths };
    delete next[path];
    this.changedPaths = next;
  }

  async loadFile(path: string): Promise<string> {
    const cached = this.fileCache.get(path);
    if (cached !== undefined) return cached;
    const res = await fetch(
      `/_sandbox/file?path=${encodeURIComponent(path)}`,
      { cache: 'no-store' },
    );
    const text = await res.text();
    this.fileCache.set(path, text);
    return text;
  }

  private connectEvents() {
    try {
      this.evtSource = new EventSource('/_sandbox/events');
    } catch {
      return;
    }
    let pendingRefresh: number | null = null;
    const scheduleRefresh = () => {
      if (pendingRefresh !== null) return;
      pendingRefresh = window.setTimeout(() => {
        pendingRefresh = null;
        this.refreshTree();
        if (this.target.kind === 'file') {
          this.fileCache.delete(this.target.path);
          const p = this.target.path;
          this.target = { kind: 'none' };
          this.target = { kind: 'file', path: p };
        }
      }, 80);
    };

    this.evtSource.onmessage = (e) => {
      let payload: { type?: string; path?: string } = {};
      try {
        payload = JSON.parse(e.data);
      } catch {
        // ignore malformed
      }
      // Only track change markers while the panel is hidden. While open,
      // the live tree update IS the signal - no need for dots.
      if (!this.isOpen && payload.path && (payload.type === 'add' || payload.type === 'change')) {
        // Don't mark the currently-viewed file (it isn't, since panel is hidden,
        // but defensive), and don't mark directory events (they have their own
        // types addDir/unlinkDir which we filter out by the add/change check).
        this.changedPaths = { ...this.changedPaths, [payload.path]: true };
      }
      scheduleRefresh();
    };
    this.evtSource.onopen = () => { this.bridgeAvailable = true; };
    this.evtSource.onerror = () => { /* EventSource auto-reconnects */ };
  }

  private startLivePolling() {
    const poll = async () => {
      let up = false;
      try {
        const res = await fetch('/_sandbox/live-up', { cache: 'no-store' });
        const data = await res.json();
        up = !!data.up;
      } catch {
        up = false;
      }
      const wasUp = this.liveUp;
      this.liveUp = up;
      // If the live app just went down while the user was viewing it,
      // drop the preview back to the placeholder so we don't keep
      // rendering a stale iframe of a server that's gone.
      if (wasUp && !up && this.target.kind === 'live-app') {
        this.target = { kind: 'none' };
      }
    };
    poll();
    this.livePollTimer = window.setInterval(poll, 1500);
  }

  isFileOpen(path: string): boolean {
    return this.target.kind === 'file' && this.target.path === path;
  }

  isLiveAppOpen(): boolean {
    return this.target.kind === 'live-app';
  }

  hasChange(path: string): boolean {
    if (this.changedPaths[path]) return true;
    // For a directory: true if any descendant file has a change marker.
    const prefix = path + '/';
    for (const p of Object.keys(this.changedPaths)) {
      if (p.startsWith(prefix)) return true;
    }
    return false;
  }

  get changeCount(): number {
    return Object.keys(this.changedPaths).length;
  }
}

export const workspace = new WorkspaceState();

export function fileKind(name: string): 'html' | 'markdown' | 'code' | 'json' | 'config' | 'other' {
  const lower = name.toLowerCase();
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) return 'markdown';
  if (lower.endsWith('.json')) return 'json';
  if (/\.(ts|tsx|js|jsx|svelte|css|scss)$/.test(lower)) return 'code';
  if (/(vite\.config|tsconfig|svelte\.config|package|\.gitkeep)/.test(lower)) return 'config';
  return 'other';
}

export function isPreviewable(name: string): boolean {
  const k = fileKind(name);
  return k === 'html' || k === 'markdown';
}
