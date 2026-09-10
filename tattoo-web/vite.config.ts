import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:4000'
  const apiProxy = {
    '/api': {
      target: proxyTarget,
      changeOrigin: true,
    },
  }

  return {
    plugins: [vue(), tailwindcss()],
    server: { port: 3001, proxy: apiProxy },
    preview: { proxy: apiProxy },
  }
})
