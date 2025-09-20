import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5081,
    open: true,
    proxy: {
      '/api/gold': {
        target: 'http://127.0.0.1:5080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    'process.env': process.env
  }
}) 