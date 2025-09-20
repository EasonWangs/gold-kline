import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5081,
    host: '0.0.0.0',
    open: false,
    allowedHosts: ['cssass.com', '127.0.0.1', 'localhost'],
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