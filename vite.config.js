import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Detecção automática de base path:
    // - GitHub Pages: VITE_BASE_PATH=/training-platform/
    // - Cloudflare Pages: VITE_BASE_PATH=/ (ou não definido)
    // - Local: VITE_BASE_PATH=/ (ou não definido)
    const basePath = process.env.VITE_BASE_PATH || '/';

    console.log(`[Vite] Mode: ${mode}, Base Path: ${basePath}`);

    return {
        plugins: [
            tsconfigPaths(),
            react(),
        ],
        // Deduplicate React and Emotion to prevent multiple instances
        resolve: {
            dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled']
        },
        base: basePath,
        preview: {
            port: 5000,
        },
        server: {
            host: '0.0.0.0',
            port: 3000,
        },
    };
});
