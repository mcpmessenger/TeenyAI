import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/preload/index.ts'),
      name: 'preload',
      fileName: 'preload',
      formats: ['cjs']
    },
    outDir: 'build',
    emptyOutDir: false,
    rollupOptions: {
      external: ['electron'],
      output: {
        entryFileNames: 'preload.js'
      }
    }
  }
});
