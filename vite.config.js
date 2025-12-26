import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configuração para GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/training-platform/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
