import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // FastAPI mounts the build output at /static, so all asset URLs need that prefix.
  base: '/static/',
  build: {
    outDir: '../static',
    emptyOutDir: true, // favicon.svg is preserved via public/ and copied on each build
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
