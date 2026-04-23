import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'url';
import path from 'path';
import { sandboxPlugin } from './scripts/sandbox-plugin.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    svelte(),
    sandboxPlugin({ root: __dirname }),
  ],
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, './src/lib'),
      $content: path.resolve(__dirname, './src/content'),
    },
  },
});
