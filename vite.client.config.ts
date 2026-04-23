import { defineConfig, mergeConfig, type Plugin } from 'vite';
import baseConfig from './vite.config';
import { visualizer } from 'rollup-plugin-visualizer';

export default mergeConfig(
    baseConfig,
    defineConfig({
        plugins: [visualizer({ filename: './dist/client/stats.html', gzipSize: true }) as Plugin],
        build: {
            outDir: 'dist/client',
            sourcemap: true, 
            minify: 'esbuild',
            chunkSizeWarningLimit: 300,
            rollupOptions: {
                output: {
                    manualChunks: (id) => {
                        if (id.includes('jspdf')) return 'vendor-jspdf';
                        if (id.includes('html2canvas')) return 'vendor-html2canvas';
                        if (id.includes('@mui/x-date-pickers')) return 'vendor-mui-x-date-pickers';
                        if (id.includes('@mui/material') || id.includes('@emotion')) return 'vendor-mui';
                        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
                        if (id.includes('node_modules')) return 'vendor-common';
                    },
                    chunkFileNames: 'assets/[name]-[hash].js',
                    entryFileNames: 'assets/[name]-[hash].js',
                    assetFileNames: 'assets/[name]-[hash].[ext]',
                },
            },
            rolldownOptions: {
                output: {
                    codeSplitting: true,
                    advancedChunks: {
                        minSize: 20_000,
                        maxSize: 200_000,
                    },
                },
            },
        },
    })
);