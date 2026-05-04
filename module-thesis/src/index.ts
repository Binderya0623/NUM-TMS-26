/**
 * module-thesis — Remote entry bootstrap
 *
 * This file is NOT the consumer-facing API.
 * The public API is declared in vite.config.ts under `exposes`:
 *   './ThesisView' → ./src/views/ThesisView.tsx
 *
 * This file just ensures Vite has a concrete entry to start tree-shaking from,
 * so the federation plugin can generate remoteEntry.js correctly.
 */
export { default as ThesisView } from './views/ThesisView';
