import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '')
  const directusUrl = (env.VITE_DIRECTUS_URL || '').replace(/\/$/, '')

  return {
    plugins: [react()],
    // Dev only: /cms/* is proxied to Directus so the browser makes same-origin
    // requests and does not depend on Directus CORS settings. Production
    // builds call VITE_DIRECTUS_URL directly (see src/lib/directus.js).
    server: directusUrl
      ? {
          proxy: {
            '/cms': {
              target: directusUrl,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/cms/, ''),
            },
          },
        }
      : {},
  }
})
