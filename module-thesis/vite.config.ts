import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

/**
 * module-thesis — Shared Business Feature Remote
 *
 * Exposes ThesisView (consumed by module-teacher and module-student).
 * Does NOT consume shared_ui as a remote — all shared components are
 * inlined directly in ThesisView.tsx to avoid nested federation issues.
 *
 * `vite build` → outputs dist/ copied to Tomcat by build-modules.sh
 */
export default defineConfig(({ command }) => {
  const isProd = command === 'build';

  return {
    base: isProd
      ? '/microfrontends/module-thesis/dist/'
      : 'http://localhost:3013/',

    plugins: [
      react(),
      federation({
        name: 'module_thesis',
        filename: 'remoteEntry.js',

        exposes: {
          './ThesisView': './src/views/ThesisView.tsx',
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
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
      outDir: 'dist',
      rollupOptions: {
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

    preview: {
      port: 3013,
      strictPort: true,
      cors: true,
    },

    server: {
      port: 3013,
      strictPort: true,
      cors: true,
    },
  };
});
