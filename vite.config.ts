import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    emptyOutDir: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: './Lighter/index.ts',
      name: 'lighter',
      fileName: 'index',
    },
    manifest: true,
    minify: true,
    reportCompressedSize: true,
  },
  server: {
    fs: {
      strict: false,
    },
  },
});
