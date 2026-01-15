import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        tsconfigPaths(),
        react(),
    ],
    // Deduplicate React and Emotion to prevent multiple instances
    resolve: {
        dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled']
    },
    base: mode === 'production' ? '/training-platform/' : '/',
    preview: {
        port: 5000,
    },
    server: {
        host: '0.0.0.0',
        port: 3000,
    },
}));
