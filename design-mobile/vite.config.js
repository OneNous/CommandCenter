import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  /* Required for Capacitor file:// and app store builds */
  base: './',
  plugins: [react()],
})
