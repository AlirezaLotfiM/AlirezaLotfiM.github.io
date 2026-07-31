import { fileURLToPath, URL } from 'node:url'
import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // <--- این خط خیلی مهمه!
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/mermaid') ||
            id.includes('node_modules/@mermaid-js') ||
            id.includes('node_modules/dagre') ||
            id.includes('node_modules/d3') ||
            id.includes('node_modules/khroma') ||
            id.includes('node_modules/chevrotain') ||
            id.includes('node_modules/langium') ||
            id.includes('node_modules/cytoscape') ||
            id.includes('node_modules/lodash')
          ) {
            return 'mermaid';
          }
        }
      }
    }
  }
})
