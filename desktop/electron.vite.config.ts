import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: resolve(__dirname, 'electron/main.ts'),
      },
      rollupOptions: {
        // ssh2 (optional cpu-features .node) must not be bundled — native ABI is system Node, not Electron.
        // Keep it external so the main process loads it from node_modules; postinstall removes cpu-features.
        external: ['electron-store', 'ssh2'],
      },
    },
  },
  preload: {
    build: {
      lib: {
        entry: resolve(__dirname, 'electron/preload.ts'),
      },
    },
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@shared-artsky': resolve(__dirname, '../design-mobile/src/lib/ArtSky.jsx'),
      },
    },
  },
})

