import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 5173 is occupied by another local project, so ShopNest gets its own
    // fixed port. strictPort makes the URL deterministic instead of
    // silently drifting to 5174/5175 on a collision.
    port: 5180,
    strictPort: true,
    // Optional: lets you call the API as /api/... without CORS during dev.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
