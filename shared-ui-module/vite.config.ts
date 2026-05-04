import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

/**
 * shared-ui-module — Design System Remote
 *
 * This module ONLY exposes components — it has no app entry of its own.
 * Consumers (module-teacher, module-student, module-admin) load it at
 * runtime via remoteEntry.js.
 *
 * `vite dev`   → serves remoteEntry.js from port 3020
 * `vite build` → outputs dist/ which is copied to Tomcat by build-modules.sh
 */
export default defineConfig(({ command }) => {
  const isProd = command === 'build';

  return {
    // Prod: Tomcat serves assets from this path, so chunk URLs resolve correctly.
    // Dev:  absolute localhost URL so the browser can fetch chunks.
    base: isProd
      ? '/microfrontends/shared-ui-module/dist/'
      : 'http://localhost:3020/',

    plugins: [
      react(),
      federation({
        name: 'shared_ui',
        filename: 'remoteEntry.js',

        exposes: {
          './SharedUI': './src/index.ts',
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

    build: {
      // federation REQUIRES esnext — do NOT change
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
      outDir: 'dist',
      rollupOptions: {
        // Vite requires an explicit entry even for remote-only modules.
        // The federation plugin adds remoteEntry.js as a second entry on top of this.
        input: path.resolve(__dirname, 'src/index.ts'),
        output: {
          entryFileNames: 'main.js',
          chunkFileNames: 'chunk-[name].js',
          assetFileNames: (assetInfo) =>
            assetInfo.name === 'remoteEntry.js' ? '[name][extname]' : 'assets/[name][extname]',
          minifyInternalExports: false,
        },
      },
    },

    // Needed when `vite preview` is used to serve built remoteEntry.js
    preview: {
      port: 3020,
      strictPort: true,
      cors: true,
    },

    server: {
      port: 3020,
      strictPort: true,
      cors: true,
    },
  };
});
