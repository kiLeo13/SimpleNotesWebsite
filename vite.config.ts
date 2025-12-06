import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'react-framework'
            }

            if (id.includes('@mui')) {
              return 'vendor-mui'
            }

            if (id.includes('framer-motion')) {
              return 'vendor-framer-motion'
            }

            if (id.includes('d3')) {
                return 'vendor-d3'
            }

            return 'vendor-others'
          }
        }
      }
    }
  }
})