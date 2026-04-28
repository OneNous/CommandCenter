import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base: './'` is required for Capacitor `file://` production builds; in dev it can break module URLs
// and leave a blank page when served from `http://localhost:*`. Use `/` while `vite dev` is running.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  plugins: [react()],
  server: {
    open: true,
    /** Phones / tablets on the LAN need this; otherwise only localhost loads the app. */
    host: true,
  },
}))
