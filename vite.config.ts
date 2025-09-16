import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src',
  build: {
    outDir: '../build',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.html'),
        preload: resolve(__dirname, 'src/preload/index.ts')
      },
      output: {
        entryFileNames: '[name].js',
        format: 'cjs' // Use CommonJS for preload script
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000
  }
});