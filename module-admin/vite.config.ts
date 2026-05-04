import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * module-admin — Vite тохиргоо
 *
 * JSF host дотор <script type="module"> тагаар ачаалагдана.
 * base: '/microfrontends/module-admin/dist/' тохиргоо нь
 * chunk болон asset файлуудыг зөв URL-аас татах боломжийг олгодог.
 */
export default defineConfig({
  // JSF-д байрлах үед chunk-уудын URL зөв байхын тулд
  base: '/microfrontends/module-admin/dist/',

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  css: {
    modules: {
      // Бодит хэш: Webpack-ийн module3/module4-тэй ижил зарчим
      // madm_ угтвар нь module-admin-ийн CSS-г бусдаас ялгана
      // [hash:6] нь файлын агуулгаас автоматаар үүсгэгддэг бодит хэш
      generateScopedName: 'madm_[local]_[hash:6]',
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
