import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';

/**
 * module-teacher — Consumer MFE
 *
 * Remote URL strategy:
 *   `vite dev`   → remotes served from individual Vite preview servers
 *   `vite build` → remotes served from Tomcat (via ./build-modules.sh)
 *
 * Port map:
 *   3020 → shared-ui-module (preview)
 *   3013 → module-thesis    (preview)
 *   8080 → Tomcat           (production build)
 */
const TOMCAT = 'http://localhost:8080/microfrontends';

export default defineConfig(({ command }) => {
  const isProd = command === 'build';

  const sharedUiUrl = isProd
    ? `${TOMCAT}/shared-ui-module/dist/remoteEntry.js`
    : 'http://localhost:3020/remoteEntry.js';

  const moduleThesisUrl = isProd
    ? `${TOMCAT}/module-thesis/dist/remoteEntry.js`
    : 'http://localhost:3013/remoteEntry.js';

  return {
    base: '/microfrontends/module-teacher/dist/',

    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'module_teacher',

        remotes: {
          shared_ui:     sharedUiUrl,
          module_thesis: moduleThesisUrl,
        },

        shared: {
          react:       { singleton: true, requiredVersion: '18.3.1' },
          'react-dom': { singleton: true, requiredVersion: '18.3.1' },
          antd:        { singleton: true, requiredVersion: '^5.22.0' },
        },
      }),
    ],

    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },

    css: {
      modules: {
        generateScopedName: 'mtch_[local]_[hash:6]',
      },
    },

    build: {
      // federation requires esnext — do NOT change this
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
      outDir: 'dist',
      rollupOptions: {
        input: path.resolve(__dirname, 'src/index.ts'),
        output: {
          entryFileNames: 'main.js',
          chunkFileNames: 'chunk-[name].js',
          // Host (jsf-host/teacher.xhtml) loads `bootstrap.css` — match student.
          // With cssCodeSplit:false Vite would emit `style.css`; rename the single
          // CSS asset so the host's <link> resolves correctly.
          assetFileNames: (info) =>
            info.name && /\.css$/.test(info.name) ? 'bootstrap.css' : '[name][extname]',
          minifyInternalExports: false,
        },
      },
    },
  };
});
