import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * module-auth — Нэвтрэх болон бүртгэлийн микрофронтэнд
 * JSF host дотор login.xhtml хуудсанд ачааллагдана.
 * Амжилттай нэвтэрсэний дараа дүрд тохирох JSF хуудас руу шилжинэ.
 */
export default defineConfig({
  // JSF-д байрлах үед chunk-уудын URL зөв байхын тулд
  base: '/microfrontends/module-auth/dist/',

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  css: {
    modules: {
      // Бодит хэш — бусад модулиудтай мөргөлдөхөөс сэргийлнэ
      generateScopedName: 'mauth_[local]_[hash:6]',
    },
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
