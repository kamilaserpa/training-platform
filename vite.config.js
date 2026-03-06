import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
        // Deduplicate React and Emotion to prevent multiple instances (Invalid hook call / useState null)
        resolve: {
            dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
            alias: {
                react: path.resolve(__dirname, 'node_modules/react'),
                'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
                '@emotion/react': path.resolve(__dirname, 'node_modules/@emotion/react'),
                '@emotion/styled': path.resolve(__dirname, 'node_modules/@emotion/styled'),
            },
        },
        // Force React/Emotion/MUI into the pre-bundle so lazy chunks use the same instance (evita Invalid hook call / useContext null)
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                '@emotion/react',
                '@emotion/styled',
                '@mui/material',
                '@mui/icons-material'
            ]
        },
        base: basePath,
        preview: {
            port: 5000,
        },
        server: {
            host: '0.0.0.0',
            port: 3000,
        },
        test: {
            environment: 'jsdom',
            globals: true,
            setupFiles: ['./src/test/setupTests.ts'],
            env: {
                // Prevent any accidental real Supabase initialization/health-check.
                VITE_USE_MOCK: 'true',
                VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
                VITE_SUPABASE_ANON_KEY: 'placeholder-key',
            },
        },
    };
});
