// Single-file build config.
//
// Produces one self-contained HTML file at `dist-single/index.html`
// with all JS, CSS, and images (from `public/`) inlined as data URIs.
// Intended for sharing with students - open locally in a browser, no
// server required. Google Fonts are left as CDN references, so the
// viewer needs a network connection for pixel-perfect typography
// (otherwise system fallback fonts are used).
//
// Run: `npm run build:single`

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [svelte(), viteSingleFile()],
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, './src/lib'),
      $content: path.resolve(__dirname, './src/content'),
    },
  },
  build: {
    outDir: 'dist-single',
    // Force every asset - images, fonts, small chunks - to be inlined
    // rather than referenced as a separate file. Set to a large value
    // so all the PNG/SVG logos embed as base64 data URIs.
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
