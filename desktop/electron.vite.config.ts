import { defineConfig } from 'electron-vite'
import { resolve } from 'node:path'

export default defineConfig({
  main: {
    entry: {
      index: resolve(__dirname, 'electron/main.ts')
    },
    build: {
      rollupOptions: {
        external: ['electron-store'],
      },
    },
  },
  preload: {
    entry: {
      index: resolve(__dirname, 'electron/preload.ts')
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    }
  }
})

