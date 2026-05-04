import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/microfrontends/module-student/dist/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: path.resolve(__dirname, 'src/index.ts'),
      output: {
        entryFileNames: 'main.js',
        chunkFileNames: 'chunk-[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
});
