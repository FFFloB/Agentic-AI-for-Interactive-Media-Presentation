// Small inline SVG icons that approximate VS Code's file-type glyphs.
// Colours hint at file kind without going pixel-accurate.

import { fileKind } from './workspace.svelte';

export type Icon = { path: string; color: string; viewBox?: string };

const ICONS = {
  folder: { color: '#dcb67a', path: 'M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z' },
  folderOpen: { color: '#dcb67a', path: 'M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v1H3V7zm0 3h19l-2 8a2 2 0 0 1-2 1.6H5a2 2 0 0 1-2-2V10z' },
  html:     { color: '#e44d26', path: 'M4 3h16l-1.5 17L12 22l-6.5-2L4 3zm3.2 3.5L8 17.7l4 1.1 4-1.1.9-11.2H7.2zM9 9.8h6l-.2 2.2H11v2.1l3.5.9-.2 2.3-3.3-.9h-.1v-2.4L8.9 14 9 9.8z' },
  markdown: { color: '#519aba', path: 'M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm2 11h2v-4l2 2 2-2v4h2V8H9l-2 2-2-2H5v8zm12-3h-2V8h-2v5h-2l3 4 3-4z' },
  svelte:   { color: '#ff3e00', path: 'M18.5 3.5c-2.8-1.8-6.5-1-8.3 1.6l-.3.5-.3-.1c-3.2-1-6.6.8-7.6 3.9-.6 1.7-.3 3.6.7 5.1-.6 1.2-.7 2.5-.4 3.8.9 3.2 4.2 5 7.4 4.3.5-.1 1-.3 1.4-.5 2.7 1.4 6 .7 7.9-1.6l.2-.3c.6-.8 1-1.7 1.1-2.7l.1-.5c.3-2-.2-4-1.4-5.6-.6-.8-1.4-1.5-2.3-2 .2-.3.3-.7.3-1.1.5-1.9-.3-3.8-1.8-4.8zM15 17c-2.1 1.4-4.9.4-5.6-2-.1-.4-.2-.8-.2-1.3 0-.2 0-.4.1-.6 0-.1.1-.2.1-.3l.1-.3.3.2c1 .8 2.2 1.4 3.5 1.8l.2.1v.2c0 .6.2 1.2.5 1.7.3.1.6.3.9.5h.1zm-3.9-6c-2.1 1.4-4.9.4-5.6-2-.1-.4-.2-.8-.2-1.3 0-.2 0-.5.1-.7v-.1c.7-2.4 3.5-3.4 5.6-2 1 .6 1.7 1.5 2 2.6.1.4.2.8.2 1.3 0 .2 0 .5-.1.7v.1c-.3 1-1 1.9-2 2.4z' },
  ts:       { color: '#3178c6', path: 'M3 3h18v18H3V3zm10 10v2.2h3.5v7H19v-7h3.5V13h-9.5zm-3.5 0v2h-2.8v7H9.2v-7H6.5V13h6z' },
  js:       { color: '#f7df1e', path: 'M3 3h18v18H3V3zm8 14.8c0 1.8 1 2.8 2.9 2.8 2 0 3.2-1 3.2-2.8v-6h-2v6c0 .8-.3 1-.9 1-.6 0-.8-.2-.9-.8l-2.3.6c.2 1 1 2 3.2 2zM17.8 18c.1-1.4 1-2 2.2-2.2-1.2-.4-1.9-.8-1.9-1.5 0-.4.2-.6.7-.6.5 0 .8.2 1 .8l1.9-.7c-.4-1-1.3-1.8-2.9-1.8-2 0-3 1.1-3 2.4 0 1.4.8 2 2 2.4 1.3.4 1.7.7 1.7 1.2 0 .5-.5.8-1.2.8-.9 0-1.4-.4-1.7-1.2l-2 .7c.5 1.5 1.7 2.3 3.5 2.3 2 0 3.3-1 3.3-2.6z' },
  json:     { color: '#f7df1e', path: 'M12 2c1.3 1.3 2 3 2 5 0 1-.3 2-.7 2.8.5.3 1 .6 1.4 1 2 2 2.4 5 1 7.4-1 1.7-3 2.8-5 2.8s-4-1.1-5-2.8c-1.4-2.4-1-5.4 1-7.4.5-.4.9-.7 1.4-1-.4-.8-.7-1.8-.7-2.8 0-2 .7-3.7 2-5h2.6zm-1.3 2.4c-.5.8-.8 1.8-.8 2.8s.3 1.8.8 2.6l.4.5.4-.5c.5-.8.8-1.8.8-2.6s-.3-2-.8-2.8l-.4-.5-.4.5z' },
  css:      { color: '#563d7c', path: 'M4 3h16l-1.5 17L12 22l-6.5-2L4 3zm3 3.5L8 17.7l4 1.1 4-1.1.4-6.8H8.2l-.1 2.2H14l-.2 2.3-1.8.5-1.8-.5L10 14h-2.2l.2 3 4 1 4-1 .4-6.7H8l-.3-2.2h8.8l.1-1.6H7z' },
  config:   { color: '#8f8f8f', path: 'M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2zm0 4.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm0 2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z' },
  file:     { color: '#8f8f8f', path: 'M6 2h9l5 5v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5L14 3.5z' },
  liveApp:  { color: '#14b8a6', path: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 3v13h10V5H7zm5 15.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z' },
};

export function iconForFile(name: string): Icon {
  const lower = name.toLowerCase();
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return ICONS.html;
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) return ICONS.markdown;
  if (lower.endsWith('.svelte')) return ICONS.svelte;
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return ICONS.ts;
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs') || lower.endsWith('.jsx')) return ICONS.js;
  if (lower.endsWith('.json')) return ICONS.json;
  if (lower.endsWith('.css') || lower.endsWith('.scss')) return ICONS.css;
  const kind = fileKind(name);
  if (kind === 'config') return ICONS.config;
  return ICONS.file;
}

export function folderIcon(open: boolean): Icon {
  return open ? ICONS.folderOpen : ICONS.folder;
}

export const liveAppIcon = ICONS.liveApp;
