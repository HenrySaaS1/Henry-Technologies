import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Subdirectory deploy (e.g. WordPress at https://henrysaas.com/hms1/): set VITE_BASE_PATH=/hms1/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  let base = (env.VITE_BASE_PATH || '/').trim() || '/'
  if (base !== '/' && !base.endsWith('/')) base = `${base}/`

  const apiTarget = (env.VITE_DEV_API_PROXY_TARGET || 'http://127.0.0.1:5000').trim() || 'http://127.0.0.1:5000'

  return {
    plugins: [react()],
    base,
    server: {
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  }
})
