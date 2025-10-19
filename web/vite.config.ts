import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/main.tsx',
      name: 'KanbanBoard',
      formats: ['iife'],
      fileName: () => 'kanban.js'
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'kanban.css';
          return assetInfo.name || 'asset';
        }
      }
    }
  }
})
