import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project URL is https://<user>.github.io/<repo>/
// CI sets VITE_BASE_PATH=/shows/ (see deploy workflow). Local dev uses relative paths.
const base = process.env.VITE_BASE_PATH?.trim() || './'

// https://vite.dev/config/
export default defineConfig({
  base: base.endsWith('/') ? base : `${base}/`,
  plugins: [react()],
})
