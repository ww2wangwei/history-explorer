import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 把大的第三方库拆成独立 chunk：缩小主 bundle + 利用浏览器长效缓存
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-gsap': ['gsap', '@gsap/react'],
          'vendor-d3': ['d3-force', 'd3-geo', 'd3-scale'],
          'vendor-maps': ['react-simple-maps', 'topojson-client'],
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },
})