import { defineConfig, mergeConfig } from 'vite';
import baseConfig from './vite.config';

export default mergeConfig(
    baseConfig,
    defineConfig({
        build: {
            outDir: 'dist/server',
            ssr: true,
            rollupOptions: {
                input: 'src/entry-server.tsx',
                output: {
                    format: 'esm', // or 'cjs' depending on Node version
                    entryFileNames: 'entry-server.js',
                },
            },
            // Do not split chunks for server
            minify: false, // Keep readable for debugging
        },
        ssr: {
            noExternal: ['@mui/*', '@emotion/*'],
        },
    })
);