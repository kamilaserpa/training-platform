import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Configuração para GitHub Pages
  base: mode === 'production' ? '/training-platform/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}))

