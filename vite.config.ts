import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  // 部署到子路径（如 /history/）。修改后需要重新构建。
  //   - 设为 '/'：根路径部署（默认）
  //   - 设为 '/history/'：子路径部署，index.html 引用的资源会用 /history/assets/...
  base: '/history/',
  plugins: [
    react(),
    // 🎯 性能优化：生成预压缩 .gz / .br 文件
    //   - gzip：旧浏览器兜底（IE、某些 Android）
    //   - brotli：现代浏览器（Chrome/Firefox/Safari/Edge 全支持），比 gzip 小 15-20%
    //   服务器端需启用对应 Content-Encoding：
    //     nginx:    gzip_static on; brotli_static on; (需 nginx-module-brotli)
    //     Caddy:    encode zstd gzip  (自动)
    //     Cloudflare Pages: 自动
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      quality: 11,
      deleteOriginFile: false,
    }),
  ],
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
          'vendor-gsap': ['gsap'],
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
